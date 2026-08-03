-- Payment Providers: broaden provider CHECK constraint to cover all
-- gateways offered by the payment UI (Vodacom M-Pesa, Airtel Money,
-- Mixx by Yas/Tigo, Halopesa, Azampesa) and the legacy 'tigopesa' value.

ALTER TABLE payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_provider_check;

ALTER TABLE payment_transactions
  ADD CONSTRAINT payment_transactions_provider_check
  CHECK (provider IN ('azampesa', 'mpesa', 'tigopesa', 'tigo', 'airtel', 'halopesa', 'manual'));
