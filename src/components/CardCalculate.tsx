// encrypt salary
type TCardCalculate = {
  handleEncrypt: () => void;
  setSalary: (salary: number) => void;
  salary: number;
  isLoggedIn: boolean;
  status: string;
};

const CardCalculate: React.FC<TCardCalculate> = ({
  salary,
  status,
  isLoggedIn,
  setSalary,
  handleEncrypt,
}) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2 style={{ fontWeight: "bold", marginBottom: "20px" }}>
        Step 2: Encrypt Salary
      </h2>

      <span
        style={{
          color: "grey",
          fontSize: "12px",
          marginBottom: "20px",
          display: "block",
        }}
      >
        For this step, users will prepare the base salary to be used in the
        payroll calculation.<br/> At this stage, the data will first be encrypted.
      </span>

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
        {status}
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "10px",
        }}
      >
        <label>Salary</label>
        <input
          type="number"
          value={salary}
          onChange={(e) => setSalary(Number(e.target.value))}
          style={{
            border: "1px solid #dee2e6",
            borderRadius: "5px",
            width: "100%",
            height: "50px",
            padding: "5px",
            boxSizing: "border-box",
          }}
        />
      </div>

      <button
        onClick={handleEncrypt}
        disabled={!isLoggedIn}
        style={{
          padding: "10px 20px",
          backgroundColor: !isLoggedIn ? "#ccc" : "#283A97",
          color: "white",
          border: "none",
          borderRadius: "5px",
          width: "100%",
          cursor: !isLoggedIn ? "not-allowed" : "pointer",
        }}
      >
        Encrypt Salary
      </button>
    </div>
  );
};

export default CardCalculate;