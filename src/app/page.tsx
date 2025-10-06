'use client'
import { useState } from 'react'
import { client } from '@passwordless-id/webauthn'

export default function Home() {
  const [salary, setSalary] = useState<number>(100000)
  const [chiptext, setChiptext] = useState<ArrayBuffer>(new ArrayBuffer(0))
  const [isRegistered, setIsRegistered] = useState<boolean>(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [status, setStatus] = useState<string>('')
  const [decryptedSalary, setDecryptedSalary] = useState<string>('')
  const challenge = "userID"

  // Store the encrypted session key and IVs
  const [encryptedSessionKey, setEncryptedSessionKey] = useState<ArrayBuffer>(new ArrayBuffer(0))
  const [iv, setIv] = useState<Uint8Array>(new Uint8Array(0))
  const [sessionKeyIv, setSessionKeyIv] = useState<Uint8Array>(new Uint8Array(0))

  const handleRegister = async () => {
    try {
      setStatus('Starting biometric registration...')

      // Register a new WebAuthn credential
      const registration = await client.register({
        user: "userID",
        challenge: "registration-challenge"
      });

      setStatus('Biometric registration successful!')
      setIsRegistered(true)
      setIsLoggedIn(true)
      console.log('Registration successful:', registration)
    } catch (error) {
      setStatus(`Registration failed: ${error}`)
      console.error('Registration error:', error)
    }
  }

  const handleLogin = async () => {
    try {
      setStatus('Attempting biometric login...')

      // First, try to authenticate with existing credentials
      try {
        const assertion = await navigator.credentials.get({
          publicKey: {
            challenge: new TextEncoder().encode(challenge),
            allowCredentials: [],
            userVerification: "required",
            timeout: 60000
          }
        });

        if (assertion) {
          setStatus('Login successful! You are now authenticated.')
          setIsLoggedIn(true)
          setIsRegistered(true)
          console.log('Login successful:', assertion)
          return
        }
      } catch (authError) {
        // If authentication fails, check if user needs to register
        setStatus('No existing credentials found. Please register first.')
        console.log('Authentication failed, user needs to register:', authError)

        // Show option to register
        const shouldRegister = confirm('No biometric credentials found. Would you like to register now?')
        if (shouldRegister) {
          await handleRegister()
        } else {
          setStatus('Login cancelled. Please register to continue.')
        }
      }
    } catch (error) {
      setStatus(`Login failed: ${error}`)
      console.error('Login error:', error)
    }
  }

  const handleEncrypt = async () => {
    try {
      if (!isLoggedIn) {
        setStatus('Please login first!')
        return
      }

      setStatus('Authenticating with biometric to encrypt...')

      // First authenticate with biometric to get the private key
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new TextEncoder().encode(challenge),
          allowCredentials: [],
          userVerification: "required",
          timeout: 60000
        }
      });

      if (!assertion) {
        setStatus('Biometric authentication failed!')
        return
      }

      setStatus('Biometric authentication successful! Encrypting...')

      // Generate a random AES session key
      const sessionKey = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );

      // Generate random IV
      const randomIv = crypto.getRandomValues(new Uint8Array(12));
      setIv(randomIv);

      // Encrypt the salary using AES-GCM
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: randomIv },
        sessionKey,
        new TextEncoder().encode(salary.toString())
      );

      // Encrypt the session key with the WebAuthn public key
      // For this demo, we'll use a simple approach where we derive a key from the assertion
      const publicKeyAssertion = assertion as PublicKeyCredential;
      const authenticatorAssertionResponse = publicKeyAssertion.response as AuthenticatorAssertionResponse;
      const assertionBuffer = new Uint8Array(authenticatorAssertionResponse.authenticatorData);
      const derivedKey = await crypto.subtle.importKey(
        'raw',
        assertionBuffer.slice(0, 32), // Use first 32 bytes as key material
        { name: "AES-GCM" },
        false,
        ["encrypt"]
      );

      // Encrypt the session key with the derived key
      const sessionKeyData = await crypto.subtle.exportKey('raw', sessionKey);
      const sessionKeyIvValue = crypto.getRandomValues(new Uint8Array(12));
      setSessionKeyIv(sessionKeyIvValue);
      const encryptedSessionKeyData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: sessionKeyIvValue },
        derivedKey,
        sessionKeyData
      );

      setEncryptedSessionKey(encryptedSessionKeyData);
      setChiptext(encrypted);
      setStatus('Salary encrypted successfully with biometric protection!')
      console.log('Encrypted salary:', encrypted);
    } catch (error) {
      setStatus(`Encryption failed: ${error}`)
      console.error('Encryption error:', error)
    }
  }

  const handleDecrypt = async () => {
    try {
      if (!isLoggedIn) {
        setStatus('Please login first!')
        return
      }

      if (chiptext.byteLength === 0) {
        setStatus('No encrypted data to decrypt!')
        return
      }

      setStatus('Authenticating with biometric...')

      // Get biometric authentication
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new TextEncoder().encode(challenge),
          allowCredentials: [],
          userVerification: "required",
          timeout: 60000
        }
      });

      if (!assertion) {
        setStatus('Biometric authentication failed!')
        return
      }

      setStatus('Biometric authentication successful! Decrypting session key...')

      // Derive the same key used for encryption
      const publicKeyAssertion = assertion as PublicKeyCredential;
      const authenticatorAssertionResponse = publicKeyAssertion.response as AuthenticatorAssertionResponse;
      const assertionBuffer = new Uint8Array(authenticatorAssertionResponse.authenticatorData);
      const derivedKey = await crypto.subtle.importKey(
        'raw',
        assertionBuffer.slice(0, 32), // Use first 32 bytes as key material
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      // Decrypt the session key using the derived key
      const sessionKeyData = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(sessionKeyIv) },
        derivedKey,
        encryptedSessionKey
      );

      // Import the decrypted session key
      const sessionKey = await crypto.subtle.importKey(
        'raw',
        sessionKeyData,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      setStatus('Session key decrypted! Decrypting salary...')

      // Decrypt the salary
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        sessionKey,
        chiptext
      );

      const salaryText = new TextDecoder().decode(decrypted);
      setDecryptedSalary(salaryText);
      setStatus(`Decryption successful! Salary: ${salaryText}`)
      console.log("Decrypted salary:", salaryText);
    } catch (error) {
      setStatus(`Decryption failed: ${error}`)
      console.error('Decryption error:', error)
    }
  }

  const handleDecryptWithoutSessionKey = async () => {
    const fakeSessionKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      fakeSessionKey,
      chiptext
    );

    setDecryptedSalary(new TextDecoder().decode(decrypted));
  }

  

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Biometric Salary Encryption Demo</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>Step 1: Login or Register</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button
            onClick={handleLogin}
            disabled={isLoggedIn}
            style={{
              padding: '10px 20px',
              backgroundColor: isLoggedIn ? '#4CAF50' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isLoggedIn ? 'default' : 'pointer'
            }}
          >
            {isLoggedIn ? '✓ Logged In' : 'Login with Biometric'}
          </button>
          <button
            onClick={handleRegister}
            disabled={isRegistered}
            style={{
              padding: '10px 20px',
              backgroundColor: isRegistered ? '#4CAF50' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isRegistered ? 'default' : 'pointer'
            }}
          >
            {isRegistered ? '✓ Registered' : 'Register Biometric'}
          </button>
        </div>
        <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>
          {!isLoggedIn ? 'Login to authenticate with existing credentials, or register if this is your first time.' : 'You are authenticated and ready to encrypt/decrypt data.'}
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Step 2: Encrypt Salary</h2>
        <div style={{ marginBottom: '10px' }}>
          <label>Salary: </label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            style={{ padding: '5px', marginLeft: '10px' }}
          />
        </div>
        <button
          onClick={handleEncrypt}
          disabled={!isLoggedIn}
          style={{
            padding: '10px 20px',
            backgroundColor: !isLoggedIn ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: !isLoggedIn ? 'not-allowed' : 'pointer'
          }}
        >
          Encrypt Salary
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Step 3: Decrypt with Biometric</h2>
        <button
          onClick={handleDecrypt}
          disabled={!isLoggedIn || chiptext.byteLength === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: (!isLoggedIn || chiptext.byteLength === 0) ? '#ccc' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (!isLoggedIn || chiptext.byteLength === 0) ? 'not-allowed' : 'pointer'
          }}
        >
          Decrypt with Biometric
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleDecryptWithoutSessionKey}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Decrypt without session key
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Status</h2>
        <p style={{
          padding: '10px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '5px',
          minHeight: '20px'
        }}>
          {status || 'Ready to start...'}
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Results</h2>
        <p><strong>Original Salary:</strong> {salary}</p>
        <p><strong>Encrypted Data:</strong> {chiptext.byteLength > 0 ? `${chiptext.byteLength} bytes` : 'None'}</p>
        {decryptedSalary && (
          <p><strong>Decrypted Salary:</strong> {decryptedSalary}</p>
        )}
      </div>
    </div>
  );
}
