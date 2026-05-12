export interface Subscription {
  id: string; // uuid
  establishment_id: string; // FK establishments.id
  plan_type: PlanType;
  status: string;
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
  created_at: Date;
}

export enum PlanType {
  FREE = "free",
  BASIC = "basic",
  PRO = "pro",
  PREMIUM = "premium",
}

export interface CreateSubscriptionInput extends Omit<Subscription, "id" | "created_at"> {}
export interface UpdateSubscriptionInput extends Partial<CreateSubscriptionInput> {}