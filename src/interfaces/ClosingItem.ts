export type ClosingType = 'shift' | 'profit' | 'cylinder';

export interface ExpenseItem {
  id?: string;
  description: string;
  category: string;
  amount: number;
  occurredAt: string;
  shift?: string;
  createdBy?: string;
  createdAt: string;
}

export interface CylinderLine {
  productId: string;
  type: string;
  size: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface ClosingItem {
  id?: string;
  type: ClosingType;
  status: 'confirmed';
  orderIds: string[];
  orderCodes: string[];
  from: string;
  to: string;
  totalSales: number;
  cashTotal: number;
  sinpeTotal: number;
  otherTotal: number;
  expenseTotal: number;
  costTotal: number;
  expectedAmount: number;
  declaredAmount: number;
  difference: number;
  differenceNote?: string;
  cylinderLines?: CylinderLine[];
  createdAt: string;
  createdBy: string;
}
