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
  return (
    <>
      <div style={{ marginBottom: "20px" }}>
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
            width="96"
            height="96"
            viewBox="0 0 48 48"
          >
            <g
              fill="none"
              stroke="#81d95d"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            >
              <path d="M38 4H10a2 2 0 0 0-2 2v36a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2M17 30h14m-14 6h7" />
              <path d="m30 13l-8 8l-4-4" />
            </g>
          </svg>

          <h2 style={{ fontWeight: "bold", margin: "0 30px" }}>
            Success
          </h2>

          <span></span>
        </div>

        <div className="card-ui" style={{ marginBottom: "20px" }}>
          <h2 style={{ fontWeight: "bold" }}>Final Results</h2>
          <p>
            <strong>Original Salary:</strong> {salary}
          </p>
          <p>
            <strong>Encrypted Data:</strong>{" "}
            {chiptext.byteLength > 0 ? `${chiptext.byteLength} bytes` : "None"}
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