
CREATE TABLE IF NOT EXISTS public.workspace_invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL
        REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email text NOT NULL,
    role text NOT NULL
        CHECK (role IN ('admin', 'editor', 'reviewer', 'viewer')),
    token_hash text NOT NULL UNIQUE
        CHECK (length(token_hash) = 64),
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'revoked')),
    invited_by uuid NOT NULL REFERENCES auth.users(id),
    accepted_by uuid REFERENCES auth.users(id),
    expires_at timestamptz NOT NULL,
    accepted_at timestamptz,
    revoked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspace_invitations_workspace
ON public.workspace_invitations(workspace_id);

CREATE INDEX IF NOT EXISTS idx_workspace_invitations_email
ON public.workspace_invitations(lower(email));

CREATE INDEX IF NOT EXISTS idx_workspace_invitations_pending
ON public.workspace_invitations(workspace_id, lower(email))
WHERE status = 'pending';

ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.workspace_invitations
FROM PUBLIC, anon, authenticated;

GRANT ALL ON public.workspace_invitations TO service_role;


CREATE OR REPLACE FUNCTION public.accept_workspace_invitation(
    p_token_hash text,
    p_user_id uuid,
    p_email text
)
RETURNS TABLE (
    workspace_id uuid,
    role text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    invitation public.workspace_invitations;
BEGIN
    IF p_user_id IS NULL OR p_email IS NULL OR
       trim(p_email) = '' THEN
        RAISE EXCEPTION 'Valid user information is required';
    END IF;

    SELECT *
    INTO invitation
    FROM public.workspace_invitations AS wi
    WHERE wi.token_hash = p_token_hash
      AND wi.status = 'pending'
      AND wi.revoked_at IS NULL
      AND wi.expires_at > now()
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invitation is invalid, expired, or already used';
    END IF;

    IF lower(invitation.email) <> lower(trim(p_email)) THEN
        RAISE EXCEPTION 'This invitation belongs to another email address';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.workspace_members AS wm
        WHERE wm.user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'This user already belongs to a workspace';
    END IF;

    INSERT INTO public.workspace_members (
        workspace_id,
        user_id,
        role
    )
    VALUES (
        invitation.workspace_id,
        p_user_id,
        invitation.role
    );

    UPDATE public.workspace_invitations
    SET
        status = 'accepted',
        accepted_by = p_user_id,
        accepted_at = now()
    WHERE id = invitation.id;

    RETURN QUERY
    SELECT invitation.workspace_id, invitation.role;
END;
$function$;

REVOKE ALL ON FUNCTION public.accept_workspace_invitation(text, uuid, text)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.accept_workspace_invitation(text, uuid, text)
TO service_role;
