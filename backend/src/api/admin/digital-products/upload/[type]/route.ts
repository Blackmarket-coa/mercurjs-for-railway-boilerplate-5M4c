import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError } from "@medusajs/framework/utils"

// Allowed MIME types for digital product uploads
const ALLOWED_MIME_TYPES = new Set([
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Documents
  "application/pdf",
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  // Video
  "video/mp4",
  "video/webm",
  // Archives (for digital downloads)
  "application/zip",
  "application/x-zip-compressed",
])

// Maximum file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const access = req.params.type === "main" ? "private" : "public"
  const input = req.files as Express.Multer.File[]

  if (!input?.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No files were uploaded"
    )
  }

  // Validate each file
  for (const file of input) {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `File "${file.originalname}" exceeds maximum size of 100MB`
      )
    }
    
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `File type "${file.mimetype}" is not allowed. Allowed types: images, PDFs, audio, video, and ZIP archives`
      )
    }
    
    // Sanitize filename - remove path traversal attempts
    if (file.originalname.includes("..") || file.originalname.includes("/") || file.originalname.includes("\\")) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid filename: "${file.originalname}"`
      )
    }
  }

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: input?.map((f) => ({
        filename: f.originalname,
        mimeType: f.mimetype,
        content: f.buffer.toString("binary"),
        access,
      })),
    },
  })

  res.status(200).json({ files: result })
}
