import { useState } from "react"
import {
  FocusModal,
  Heading,
  Input,
  Select,
  Label,
  Button,
  toast,
  Badge,
  Text,
} from "@medusajs/ui"
import { XMark, Plus } from "@medusajs/icons"
import { MediaType, CreateDigitalProductMediaInput, UploadedFile } from "../types"
import { sdk } from "../../../lib/sdk"

interface MediaToUpload {
  type: MediaType
  file?: File
}

interface CreateDigitalProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
}

export const CreateDigitalProductModal = ({
  open,
  onOpenChange,
  onSubmit,
}: CreateDigitalProductModalProps) => {
  const [name, setName] = useState("")
  const [productTitle, setProductTitle] = useState("")
  const [medias, setMedias] = useState<MediaToUpload[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addMedia = () => {
    setMedias([...medias, { type: MediaType.PREVIEW }])
  }

  const removeMedia = (index: number) => {
    setMedias(medias.filter((_, i) => i !== index))
  }

  const updateMedia = (index: number, data: Partial<MediaToUpload>) => {
    setMedias(medias.map((media, i) => 
      i === index ? { ...media, ...data } : media
    ))
  }

  const uploadMediaFiles = async (type: MediaType): Promise<{
    mediaWithFiles: MediaToUpload[]
    files: UploadedFile[]
  } | undefined> => {
    const formData = new FormData()
    const mediaWithFiles = medias.filter(
      (media) => media.file !== undefined && media.type === type
    )

    if (!mediaWithFiles.length) {
      return undefined
    }

    mediaWithFiles.forEach((media) => {
      if (media.file) {
        formData.append("files", media.file)
      }
    })

    const response = await sdk.client.fetch<{ files: UploadedFile[] }>(
      `/admin/digital-products/upload/${type}`,
      {
        method: "POST",
        body: formData,
      }
    )

    return {
      mediaWithFiles,
      files: response.files,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Product name is required")
      return
    }

    if (!productTitle.trim()) {
      toast.error("Product title is required")
      return
    }

    if (medias.length === 0 || !medias.some(m => m.file)) {
      toast.error("At least one media file is required")
      return
    }

    setIsLoading(true)
    try {
      // Upload preview files
      const previewResult = await uploadMediaFiles(MediaType.PREVIEW)
      // Upload main files
      const mainResult = await uploadMediaFiles(MediaType.MAIN)

      const mediaData: CreateDigitalProductMediaInput[] = []

      previewResult?.mediaWithFiles.forEach((media, index) => {
        mediaData.push({
          type: media.type,
          file_id: previewResult.files[index].id,
          mime_type: media.file!.type,
        })
      })

      mainResult?.mediaWithFiles.forEach((media, index) => {
        mediaData.push({
          type: media.type,
          file_id: mainResult.files[index].id,
          mime_type: media.file!.type,
        })
      })

      await onSubmit({
        name: name.trim(),
        medias: mediaData,
        product: {
          title: productTitle.trim(),
          options: [{
            title: "Default",
            values: ["default"],
          }],
          variants: [{
            title: productTitle.trim(),
            options: {
              Default: "default",
            },
            manage_inventory: false,
            prices: [],
          }],
        },
      })

      toast.success("Digital product created successfully")
      handleClose()
    } catch (error: any) {
      console.error("Failed to create digital product:", error)
      toast.error(error.message || "Failed to create digital product")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setName("")
    setProductTitle("")
    setMedias([])
    onOpenChange(false)
  }

  return (
    <FocusModal open={open} onOpenChange={onOpenChange}>
      <FocusModal.Content>
        <FocusModal.Header>
          <Heading>Create Digital Product</Heading>
        </FocusModal.Header>
        <FocusModal.Body className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Digital Product Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Digital Product Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Premium E-Book"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Text className="text-ui-fg-subtle" size="small">
                Internal name for this digital product
              </Text>
            </div>

            {/* Product Title */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="productTitle">Product Title</Label>
              <Input
                id="productTitle"
                name="productTitle"
                placeholder="e.g., The Complete Guide to Digital Marketing"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
              />
              <Text className="text-ui-fg-subtle" size="small">
                This will be the product title shown to customers
              </Text>
            </div>

            {/* Media Files */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label>Media Files</Label>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="small"
                  onClick={addMedia}
                >
                  <Plus className="mr-1" />
                  Add File
                </Button>
              </div>

              {medias.length === 0 ? (
                <div className="border border-dashed border-ui-border-base rounded-lg p-6 text-center">
                  <Text className="text-ui-fg-subtle">
                    No files added yet. Click "Add File" to upload your digital content.
                  </Text>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {medias.map((media, index) => (
                    <div 
                      key={index} 
                      className="border border-ui-border-base rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge color={media.type === MediaType.MAIN ? "green" : "blue"}>
                          File {index + 1}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="text-ui-fg-subtle hover:text-ui-fg-base"
                        >
                          <XMark />
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div>
                          <Label htmlFor={`type-${index}`}>File Type</Label>
                          <Select
                            value={media.type}
                            onValueChange={(value) => updateMedia(index, { type: value as MediaType })}
                          >
                            <Select.Trigger>
                              <Select.Value placeholder="Select type" />
                            </Select.Trigger>
                            <Select.Content>
                              <Select.Item value={MediaType.PREVIEW}>
                                Preview (free sample)
                              </Select.Item>
                              <Select.Item value={MediaType.MAIN}>
                                Main (paid content)
                              </Select.Item>
                            </Select.Content>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`file-${index}`}>File</Label>
                          <Input
                            id={`file-${index}`}
                            type="file"
                            onChange={(e) => updateMedia(index, { file: e.target.files?.[0] })}
                          />
                          {media.file && (
                            <Text className="text-ui-fg-subtle mt-1" size="small">
                              Selected: {media.file.name}
                            </Text>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4 border-t border-ui-border-base">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
              >
                Create Digital Product
              </Button>
            </div>
          </form>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}
