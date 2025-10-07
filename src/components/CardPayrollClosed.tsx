type TCardPayrollClosed = {
  handleDecrypt: () => void;
  handleRegister: () => void;
  isLoggedIn: boolean;
  chiptext: ArrayBuffer;
  handleDecryptWithoutSessionKey: () => void;
  status: string;
};

const CardPayrollClosed: React.FC<TCardPayrollClosed> = ({
  handleDecrypt,
  isLoggedIn,
  chiptext,
  handleDecryptWithoutSessionKey,
  status,
}) => {
  return (
    <>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "30px" }}>
          Step 3: Decrypt with Biometric
        </h2>
        <p
          style={{
            padding: "10px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "5px",
            minHeight: "20px",
            marginBottom: "20px",
          }}
        >
          {status || "Ready to start..."}
        </p>

        <div
          style={{
            display: "flex",
            // flexDirection: "column",
            marginBottom: "20px",
            gap: "10px",
          }}
        >
          <button
            onClick={handleDecrypt}
            disabled={!isLoggedIn || chiptext.byteLength === 0}
            // style={{
            //   padding: "10px 20px",
            //   backgroundColor:
            //     !isLoggedIn || chiptext.byteLength === 0 ? "#ccc" : "#dc3545",
            //   color: "white",
            //   border: "none",
            //   borderRadius: "5px",
            //   cursor:
            //     !isLoggedIn || chiptext.byteLength === 0
            //       ? "not-allowed"
            //       : "pointer",
            // }}
            className="card-decrypt"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="96"
              height="96"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M2 7.986c.11-2.21.437-3.588 1.418-4.568S5.776 2.11 7.986 2M22 7.986c-.11-2.21-.437-3.588-1.418-4.568S18.225 2.11 16.014 2m0 20c2.21-.11 3.588-.437 4.569-1.418S21.89 18.225 22 16.014M7.986 22c-2.21-.11-3.588-.437-4.568-1.418S2.11 18.225 2 16.014m14.515-7.072c.317.576.485 1.21.485 1.857v2.882c0 1.134-.536 2.252-1.464 3.054C14.606 17.537 13.313 18 12 18m-5-6.722v2.403c0 1.258.654 2.496 1.801 3.321M14.5 6.579a5.7 5.7 0 0 0-3.794-.432c-1.28.297-2.373 1.02-3.036 2.013m5.996 3.318v-.887c.01-.636-.533-1.21-1.27-1.36m-2.062 2.626v1.524c-.006.28.093.555.282.788c.59.728 1.91.811 2.624.154"
              />
            </svg>{" "}
            Decrypt with Biometric
          </button>
          <button
            onClick={handleDecryptWithoutSessionKey}
            className="card-decrypt"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="96"
              height="96"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12.67 13.67c-.47.46-1.04.83-1.67 1.06V23H8v-2H5v-3h3v-3.28c-1.74-.62-3-2.26-3-4.22C5 8 7 6 9.5 6h.1c-.47.95-.68 2-.57 3.08c-.59.2-1.03.76-1.03 1.42c0 .83.67 1.5 1.5 1.5c.23 0 .45-.06.65-.15c.64.84 1.52 1.47 2.52 1.82m8.06 5.77l-2.76 1.16l-.78-1.84l-2.76 1.17l-1.17-2.77L16.03 16l-1.27-3c-1.85.08-3.65-.95-4.41-2.75c-.96-2.29.12-4.93 2.41-5.9c.24-.1.5-.17.74-.23C12.84 2.87 11.5 2 10 2C7.79 2 6 3.79 6 6v.24c-.3.26-.6.58-.85.91C5.06 6.78 5 6.4 5 6c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.42-.6 2.67-1.55 3.57c.42.43 1.05.56 1.63.31c.77-.32 1.12-1.2.8-1.96a1 1 0 0 0-.14-.26C15.9 7.13 16 6.58 16 6c0-.63-.1-1.24-.28-1.81c1.28.36 2.38 1.25 2.93 2.57c.76 1.8.24 3.81-1.15 5.05zM13 8.6c.37-.41.65-.89.82-1.42c-.54.27-.85.82-.82 1.42"
              />
            </svg>
            Decrypt without session key
          </button>
        </div>
      </div>
    </>
  );
};

export default CardPayrollClosed;