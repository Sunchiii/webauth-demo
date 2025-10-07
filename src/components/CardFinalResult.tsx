type TCardFinalResult = {
  handleDecrypt: () => void;
  isLoggedIn: boolean;
  status: string;
  salary: number;
  chiptext: ArrayBuffer;
  decryptedSalary: string;
};

const CardFinalResult: React.FC<TCardFinalResult> = ({
  salary,
  chiptext,
  decryptedSalary,
}) => {

  function arrayBufferToString(buffer: ArrayBuffer): string {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  }
  return (
    <>
      <div style={{ marginBottom: "20px" }}>
        <div className="card-ui" style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 48 48"
            >
              <g
                fill="none"
                stroke="#22BB33"
                strokeLinejoin="round"
                strokeWidth="4"
              >
                <rect width="36" height="36" x="6" y="6" rx="3" />
                <path
                  strokeLinecap="round"
                  d="M4 31h11l2 4h14l2-4h11m-2 5V26M6 36V26m11-7.385L22.6 24L33 14"
                />
              </g>
            </svg>

            <h2 style={{ fontSize: "20px", margin: "0 30px" }}>Success!</h2>

            <span></span>
          </div>

          <h2 style={{ fontWeight: "bold" }}>Final Results</h2>
          <p>
            <strong>Original Salary:</strong> {salary}
          </p>
          <p >
            <strong>Encrypted Data:</strong>{" "}
            <span className="border border-gray-300">{chiptext.byteLength > 0 ? `${arrayBufferToString(chiptext)}` : "None"}</span>
          </p>
          {decryptedSalary && (
            <p>
              <strong>Decrypted Salary:</strong> {decryptedSalary}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default CardFinalResult;
