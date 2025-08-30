import { DatasetRow } from "@/types/dataset";

export function toCSV(rows: DatasetRow[]) {
    const header = [
        "Customer ID", "Gender", "Senior Citizen", "Partner", "Dependents",
        "Tenure", "Phone Service", "Multiple Lines", "Internet Service",
        "Online Security", "Online Backup", "Device Protection", "Tech Support",
        "Streaming TV", "Streaming Movies", "Contract", "Paperless Billing",
        "Payment Method", "Monthly Charges", "Total Charges", "Churn"
    ].join(",");
    const body = rows
        .map((r) => [
            r.customerID, r.gender, r.SeniorCitizen, r.Partner, r.Dependents,
            r.tenure, r.PhoneService, r.MultipleLines, r.InternetService,
            r.OnlineSecurity, r.OnlineBackup, r.DeviceProtection, r.TechSupport,
            r.StreamingTV, r.StreamingMovies, r.Contract, r.PaperlessBilling,
            r.PaymentMethod, r.MonthlyCharges, r.TotalCharges, r.Churn
        ].join(","))
        .join("\n");
    return `${header}\n${body}`;
}
