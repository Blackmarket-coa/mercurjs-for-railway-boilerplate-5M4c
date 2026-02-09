import { useState } from "react"
import { FileUpload } from "@/components/common/file-upload"
import type { FileType } from "@/components/common/file-upload"
import { Hint } from "@medusajs/ui"
import { useTranslation } from "react-i18next"

const SUPPORTED_FORMATS = ["text/csv"]
const SUPPORTED_FORMATS_FILE_EXTENSIONS = [".csv"]

const hasSupportedExtension = (filename: string) => {
  const lowerCasedFilename = filename.toLowerCase()

  return SUPPORTED_FORMATS_FILE_EXTENSIONS.some((ext) =>
    lowerCasedFilename.endsWith(ext)
  )
}

export const UploadImport = ({
  onUploaded,
}: {
  onUploaded: (file: File) => void
}) => {
  const { t } = useTranslation()
  const [error, setError] = useState<string>()

  const hasInvalidFiles = (fileList: FileType[]) => {
    const invalidFile = fileList.find(
      (f) =>
        !SUPPORTED_FORMATS.includes(f.file.type) &&
        !hasSupportedExtension(f.file.name)
    )

    if (invalidFile) {
      setError(
        t("products.media.invalidFileType", {
          name: invalidFile.file.name,
          types: SUPPORTED_FORMATS_FILE_EXTENSIONS.join(", "),
        })
      )

      return true
    }

    return false
  }

  return (
    <div className="flex flex-col gap-y-4">
      <FileUpload
        label={t("products.import.uploadLabel")}
        hint={t("products.import.uploadHint")}
        multiple={false}
        hasError={!!error}
        formats={SUPPORTED_FORMATS}
        onUploaded={(files) => {
          setError(undefined)
          if (hasInvalidFiles(files)) {
            return
          }
          onUploaded(files[0].file)
        }}
      />

      {error && (
        <div>
          <Hint variant="error">{error}</Hint>
        </div>
      )}
    </div>
  )
}
