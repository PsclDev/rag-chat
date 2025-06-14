import type { FileDto } from './file.types'

export interface DocumentStatusStep {
  status: 'queued' | 'processing' | 'completed'
  label: string
}

export interface DocumentDto {
  id: string
  file: FileDto
  status: DocumentStatusDto[]
  attachments: FileDto[]
  createdAt: Date
  updatedAt: Date
}

export interface DocumentStatusDto {
  step: DocumentStatusStep
  startedAt: Date | null
  completedAt: Date | null
  failed: boolean
}
