-- Custom SQL migration file, put your code below! --
-- Insert provided account for that user (many token fields are empty)
INSERT INTO account (
    id, account_id, provider_id, user_id, access_token, refresh_token, id_token,
    access_token_expires_at, refresh_token_expires_at, scope, password, created_at, updated_at
) VALUES (
    'p7yNPsNhzwAwd2lA9dnhTlzc7N1yBPwx',
    'ksvRFWystegfkOsHCEzKhaxRWtAYGrn0',
    'credential',
    'ksvRFWystegfkOsHCEzKhaxRWtAYGrn0',
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    '47653ad77654f9e38d4f908f5677632c:8ca7a433af0759ce58d3873564e1b4a31db6426243b1b2f9306dc3d3bbbe216229ebc12a3917d18318565779f1f5d197435c2b2873f09d86493dc19d8a35f4a1',
    1763744855,
    1763744855
);