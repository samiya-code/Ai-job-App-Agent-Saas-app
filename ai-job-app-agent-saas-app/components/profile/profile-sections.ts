import {
  Briefcase01Icon,
  Certificate01Icon,
  Link01Icon,
  Mortarboard01Icon,
  SourceCodeIcon,
  SparklesIcon,
  TextAlignLeftIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"

import type { ProfileSectionKey } from "@/lib/profile/completeness"

export type ProfileSection = {
  value: ProfileSectionKey
  label: string
  icon: typeof UserIcon
}

export const PROFILE_SECTIONS: ProfileSection[] = [
  { value: "personal", label: "Personal", icon: UserIcon },
  { value: "summary", label: "Summary", icon: TextAlignLeftIcon },
  { value: "experience", label: "Experience", icon: Briefcase01Icon },
  { value: "education", label: "Education", icon: Mortarboard01Icon },
  { value: "skills", label: "Skills", icon: SparklesIcon },
  { value: "projects", label: "Projects", icon: SourceCodeIcon },
  { value: "certifications", label: "Certifications", icon: Certificate01Icon },
  { value: "links", label: "Links", icon: Link01Icon },
]
