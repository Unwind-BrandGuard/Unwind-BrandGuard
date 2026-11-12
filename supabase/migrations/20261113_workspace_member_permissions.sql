
-- Remove the existing broad membership management policies.

DROP POLICY IF EXISTS "Admins can add workspace members"
ON public.workspace_members;

DROP POLICY IF EXISTS "Admins can update workspace members"
ON public.workspace_members;

DROP POLICY IF EXISTS "Admins can remove workspace members"
ON public.workspace_members;


-- Owners can add admins, editors, reviewers and viewers.
-- Admins can add editors, reviewers and viewers.

CREATE POLICY "Authorized users can add workspace members"
ON public.workspace_members
FOR INSERT TO authenticated
WITH CHECK (
    role <> 'owner'
    AND (
        public.has_workspace_role(
            workspace_id,
            ARRAY['owner']
        )
        OR (
            role IN ('editor', 'reviewer', 'viewer')
            AND public.has_workspace_role(
                workspace_id,
                ARRAY['admin']
            )
        )
    )
);


-- Owners can manage non-owner memberships.
-- Admins can manage only editor, reviewer and viewer memberships.

CREATE POLICY "Authorized users can update workspace members"
ON public.workspace_members
FOR UPDATE TO authenticated
USING (
    user_id <> (SELECT auth.uid())
    AND (
        (
            role <> 'owner'
            AND public.has_workspace_role(
                workspace_id,
                ARRAY['owner']
            )
        )
        OR (
            role IN ('editor', 'reviewer', 'viewer')
            AND public.has_workspace_role(
                workspace_id,
                ARRAY['admin']
            )
        )
    )
)
WITH CHECK (
    role <> 'owner'
    AND (
        public.has_workspace_role(
            workspace_id,
            ARRAY['owner']
        )
        OR (
            role IN ('editor', 'reviewer', 'viewer')
            AND public.has_workspace_role(
                workspace_id,
                ARRAY['admin']
            )
        )
    )
);


-- Owners can remove any non-owner member.
-- Admins can remove only editors, reviewers and viewers.

CREATE POLICY "Authorized users can remove workspace members"
ON public.workspace_members
FOR DELETE TO authenticated
USING (
    user_id <> (SELECT auth.uid())
    AND (
        (
            role <> 'owner'
            AND public.has_workspace_role(
                workspace_id,
                ARRAY['owner']
            )
        )
        OR (
            role IN ('editor', 'reviewer', 'viewer')
            AND public.has_workspace_role(
                workspace_id,
                ARRAY['admin']
            )
        )
    )
);
