import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError } from "@medusajs/framework/utils"

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  // Determine access type based on route param
  const access: "public" | "private" = req.params.type === "main" ? "private" : "public"

  // Ensure files are present
  const files = req.files as Express.Multer.File[] | undefined
  if (!files || files.length === 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No files were uploaded"
    )
  }

  // Map uploaded files into workflow input format
  const mappedFiles = files.map(f => ({
    filename: f.originalname,
    mimeType: f.mimetype,
    content: f.buffer.toString("binary"),
    access,
  }))

  // Run the upload workflow
  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: { files: mappedFiles },
  })

  res.status(200).json({ files: result })
}
