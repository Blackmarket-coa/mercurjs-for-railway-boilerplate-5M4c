import {
  AuthenticatedMedusaRequest,
  MedusaResponse
} from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import {
  createUserWorkflow,
  CreateUserWorkflowInput,
} from "../../workflows/user/workflows/create-user";
import { createUserSchema } from "./validation-schemas";

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const auth_identity_id = req.auth_context?.auth_identity_id;

  if (!auth_identity_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Authentication identity ID is required"
    );
  }

  const validatedBody = createUserSchema.parse(req.body)

  const { result } = await createUserWorkflow(req.scope).run({
    input: {
      user: validatedBody,
      auth_identity_id,
    } as CreateUserWorkflowInput,
  })

  res.status(201).json({ user: result.user });
};
