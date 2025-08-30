export type DatasetRow = {
    customerID: string;
    gender: string;
    SeniorCitizen: number;
    Partner: string;
    Dependents: string;
    tenure: number;
    PhoneService: string;
    MultipleLines: string;
    InternetService: string;
    OnlineSecurity: string;
    OnlineBackup: string;
    DeviceProtection: string;
    TechSupport: string;
    StreamingTV: string;
    StreamingMovies: string;
    Contract: string;
    PaperlessBilling: string;
    PaymentMethod: string;
    MonthlyCharges: number;
    TotalCharges: string;
    Churn: string;
};

export type ApiResponse = {
    data: DatasetRow[];
};
