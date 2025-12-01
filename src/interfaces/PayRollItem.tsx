interface PayRollItem {
    id: string;
    projectId: string;
    date: string;
    amountUSD: number;
    amountCOL: number;
    name: string;
    socialChanges: number;
    hourlySalary: number;
    overtimeSalary: number;
    workedHours: number;
    overtimeHours: number;
}
 
export default PayRollItem;