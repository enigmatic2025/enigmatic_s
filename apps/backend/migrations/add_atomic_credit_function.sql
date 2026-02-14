-- Migration: Add atomic credit deduction function
-- This prevents race conditions in credit checking/deduction

-- Create function for atomic check-and-deduct
CREATE OR REPLACE FUNCTION check_and_deduct_credits(
    org_id_param UUID,
    cost_param INTEGER
)
RETURNS TABLE(success BOOLEAN, balance INTEGER, message TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    current_balance INTEGER;
    new_balance INTEGER;
BEGIN
    -- Lock the row for update to prevent race conditions
    SELECT ai_credits_balance INTO current_balance
    FROM organizations
    WHERE id = org_id_param
    FOR UPDATE;

    -- Check if organization exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0, 'Organization not found'::TEXT;
        RETURN;
    END IF;

    -- Check if sufficient balance
    IF current_balance < cost_param THEN
        RETURN QUERY SELECT FALSE, current_balance, 'Insufficient credits'::TEXT;
        RETURN;
    END IF;

    -- Deduct credits atomically
    new_balance := current_balance - cost_param;

    UPDATE organizations
    SET ai_credits_balance = new_balance,
        updated_at = NOW()
    WHERE id = org_id_param;

    -- Return success
    RETURN QUERY SELECT TRUE, new_balance, 'Success'::TEXT;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_and_deduct_credits(UUID, INTEGER) TO authenticated;

-- Comment
COMMENT ON FUNCTION check_and_deduct_credits IS
'Atomically checks and deducts AI credits from an organization. Prevents race conditions using row-level locking.';
