"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

import { updateProfile, type ProfileFormInput } from "@/app/dashboard/profile/actions"
import { parseOtherLinks } from "@/lib/profile/utils"
import type { ProfileData } from "@/lib/supabase/database.types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

function toFormInput(data: ProfileData): ProfileFormInput {
  return {
    fullName: data.profile.full_name ?? "",
    headline: data.profile.headline ?? "",
    professionalSummary: data.profile.professional_summary ?? "",
    phone: data.profile.phone ?? "",
    location: data.profile.location ?? "",
    website: data.profile.website ?? "",
    linkedinUrl: data.profile.linkedin_url ?? "",
    githubUrl: data.profile.github_url ?? "",
    otherLinks: parseOtherLinks(data.profile.other_links),
    workExperiences: data.workExperiences.map((exp) => ({
      id: exp.id,
      company: exp.company,
      jobTitle: exp.job_title,
      location: exp.location ?? "",
      startDate: exp.start_date ?? "",
      endDate: exp.end_date ?? "",
      isCurrent: exp.is_current,
      responsibilities: exp.responsibilities.length > 0 ? exp.responsibilities : [""],
    })),
    education: data.education.map((edu) => ({
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree ?? "",
      fieldOfStudy: edu.field_of_study ?? "",
      startDate: edu.start_date ?? "",
      endDate: edu.end_date ?? "",
    })),
    skills: data.skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      category: skill.category ?? "",
    })),
    projects: data.projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description ?? "",
      url: project.url ?? "",
      technologies: project.technologies.length > 0 ? project.technologies : [""],
    })),
    certifications: data.certifications.map((cert) => ({
      id: cert.id,
      name: cert.name,
      issuer: cert.issuer ?? "",
      issueDate: cert.issue_date ?? "",
      url: cert.url ?? "",
    })),
  }
}

type ProfileFormProps = {
  initialData: ProfileData
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [form, setForm] = useState<ProfileFormInput>(() => toFormInput(initialData))
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateProfile({
        ...form,
        workExperiences: form.workExperiences.map((exp) => ({
          ...exp,
          responsibilities: exp.responsibilities.filter(Boolean),
        })),
        projects: form.projects.map((project) => ({
          ...project,
          technologies: project.technologies.filter(Boolean),
        })),
        skills: form.skills.filter((skill) => skill.name.trim()),
        education: form.education.filter((edu) => edu.institution.trim()),
        certifications: form.certifications.filter((cert) => cert.name.trim()),
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Profile saved successfully")
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="personal">
        <TabsList className="flex-wrap">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic contact and profile details.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="headline">Headline</FieldLabel>
                    <Input
                      id="headline"
                      placeholder="e.g. Senior Software Engineer"
                      value={form.headline}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, headline: e.target.value }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      value={initialData.profile.email}
                      disabled
                      className="opacity-60"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="phone">Phone</FieldLabel>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="location">Location</FieldLabel>
                    <Input
                      id="location"
                      placeholder="City, State, Country"
                      value={form.location}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, location: e.target.value }))
                      }
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Professional Summary</CardTitle>
              <CardDescription>A brief overview of your experience and goals.</CardDescription>
            </CardHeader>
            <CardContent>
              <Field>
                <FieldLabel htmlFor="summary">Summary</FieldLabel>
                <Textarea
                  id="summary"
                  rows={8}
                  value={form.professionalSummary}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      professionalSummary: e.target.value,
                    }))
                  }
                />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="mt-4 space-y-4">
          {form.workExperiences.map((exp, index) => (
            <Card key={exp.id ?? index}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>Experience {index + 1}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      workExperiences: prev.workExperiences.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                </Button>
              </CardHeader>
              <CardContent>
                <FieldSet>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Company</FieldLabel>
                      <Input
                        value={exp.company}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            workExperiences: prev.workExperiences.map((item, i) =>
                              i === index ? { ...item, company: e.target.value } : item
                            ),
                          }))
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Job title</FieldLabel>
                      <Input
                        value={exp.jobTitle}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            workExperiences: prev.workExperiences.map((item, i) =>
                              i === index ? { ...item, jobTitle: e.target.value } : item
                            ),
                          }))
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Location</FieldLabel>
                      <Input
                        value={exp.location}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            workExperiences: prev.workExperiences.map((item, i) =>
                              i === index ? { ...item, location: e.target.value } : item
                            ),
                          }))
                        }
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel>Start date</FieldLabel>
                        <Input
                          placeholder="Jan 2020"
                          value={exp.startDate}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              workExperiences: prev.workExperiences.map((item, i) =>
                                i === index ? { ...item, startDate: e.target.value } : item
                              ),
                            }))
                          }
                        />
                      </Field>
                      <Field>
                        <FieldLabel>End date</FieldLabel>
                        <Input
                          placeholder="Present"
                          value={exp.endDate}
                          disabled={exp.isCurrent}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              workExperiences: prev.workExperiences.map((item, i) =>
                                i === index ? { ...item, endDate: e.target.value } : item
                              ),
                            }))
                          }
                        />
                      </Field>
                    </div>
                    <Field orientation="horizontal">
                      <Checkbox
                        checked={exp.isCurrent}
                        onCheckedChange={(checked) =>
                          setForm((prev) => ({
                            ...prev,
                            workExperiences: prev.workExperiences.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    isCurrent: checked === true,
                                    endDate: checked === true ? "" : item.endDate,
                                  }
                                : item
                            ),
                          }))
                        }
                      />
                      <FieldLabel>I currently work here</FieldLabel>
                    </Field>
                    <Field>
                      <FieldLabel>Responsibilities</FieldLabel>
                      <div className="flex flex-col gap-2">
                        {exp.responsibilities.map((bullet, bulletIndex) => (
                          <div key={bulletIndex} className="flex gap-2">
                            <Textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  workExperiences: prev.workExperiences.map((item, i) =>
                                    i === index
                                      ? {
                                          ...item,
                                          responsibilities: item.responsibilities.map(
                                            (b, bi) =>
                                              bi === bulletIndex ? e.target.value : b
                                          ),
                                        }
                                      : item
                                  ),
                                }))
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  workExperiences: prev.workExperiences.map((item, i) =>
                                    i === index
                                      ? {
                                          ...item,
                                          responsibilities: item.responsibilities.filter(
                                            (_, bi) => bi !== bulletIndex
                                          ),
                                        }
                                      : item
                                  ),
                                }))
                              }
                            >
                              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              workExperiences: prev.workExperiences.map((item, i) =>
                                i === index
                                  ? {
                                      ...item,
                                      responsibilities: [...item.responsibilities, ""],
                                    }
                                  : item
                              ),
                            }))
                          }
                        >
                          Add bullet
                        </Button>
                      </div>
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outline"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                workExperiences: [
                  ...prev.workExperiences,
                  {
                    company: "",
                    jobTitle: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    isCurrent: false,
                    responsibilities: [""],
                  },
                ],
              }))
            }
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
            Add experience
          </Button>
        </TabsContent>

        <TabsContent value="education" className="mt-4 space-y-4">
          {form.education.map((edu, index) => (
            <Card key={edu.id ?? index}>
              <CardHeader className="flex flex-row items-start justify-between">
                <CardTitle>Education {index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      education: prev.education.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                </Button>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Institution</FieldLabel>
                    <Input
                      value={edu.institution}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          education: prev.education.map((item, i) =>
                            i === index ? { ...item, institution: e.target.value } : item
                          ),
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Degree</FieldLabel>
                    <Input
                      value={edu.degree}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          education: prev.education.map((item, i) =>
                            i === index ? { ...item, degree: e.target.value } : item
                          ),
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Field of study</FieldLabel>
                    <Input
                      value={edu.fieldOfStudy}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          education: prev.education.map((item, i) =>
                            i === index ? { ...item, fieldOfStudy: e.target.value } : item
                          ),
                        }))
                      }
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel>Start date</FieldLabel>
                      <Input
                        value={edu.startDate}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            education: prev.education.map((item, i) =>
                              i === index ? { ...item, startDate: e.target.value } : item
                            ),
                          }))
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel>End date</FieldLabel>
                      <Input
                        value={edu.endDate}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            education: prev.education.map((item, i) =>
                              i === index ? { ...item, endDate: e.target.value } : item
                            ),
                          }))
                        }
                      />
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outline"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                education: [
                  ...prev.education,
                  {
                    institution: "",
                    degree: "",
                    fieldOfStudy: "",
                    startDate: "",
                    endDate: "",
                  },
                ],
              }))
            }
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
            Add education
          </Button>
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Technical and professional skills.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {form.skills.map((skill, index) => (
                <div key={skill.id ?? index} className="flex gap-2">
                  <Input
                    placeholder="Skill name"
                    value={skill.name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        skills: prev.skills.map((item, i) =>
                          i === index ? { ...item, name: e.target.value } : item
                        ),
                      }))
                    }
                  />
                  <Input
                    placeholder="Category (optional)"
                    value={skill.category}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        skills: prev.skills.map((item, i) =>
                          i === index ? { ...item, category: e.target.value } : item
                        ),
                      }))
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        skills: prev.skills.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    skills: [...prev.skills, { name: "", category: "" }],
                  }))
                }
              >
                <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                Add skill
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-4 space-y-4">
          {form.projects.map((project, index) => (
            <Card key={project.id ?? index}>
              <CardHeader className="flex flex-row items-start justify-between">
                <CardTitle>Project {index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      projects: prev.projects.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                </Button>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Name</FieldLabel>
                    <Input
                      value={project.name}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          projects: prev.projects.map((item, i) =>
                            i === index ? { ...item, name: e.target.value } : item
                          ),
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                      rows={3}
                      value={project.description}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          projects: prev.projects.map((item, i) =>
                            i === index ? { ...item, description: e.target.value } : item
                          ),
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>URL</FieldLabel>
                    <Input
                      value={project.url}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          projects: prev.projects.map((item, i) =>
                            i === index ? { ...item, url: e.target.value } : item
                          ),
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Technologies</FieldLabel>
                    <div className="flex flex-col gap-2">
                      {project.technologies.map((tech, techIndex) => (
                        <div key={techIndex} className="flex gap-2">
                          <Input
                            value={tech}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                projects: prev.projects.map((item, i) =>
                                  i === index
                                    ? {
                                        ...item,
                                        technologies: item.technologies.map((t, ti) =>
                                          ti === techIndex ? e.target.value : t
                                        ),
                                      }
                                    : item
                                ),
                              }))
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                projects: prev.projects.map((item, i) =>
                                  i === index
                                    ? {
                                        ...item,
                                        technologies: item.technologies.filter(
                                          (_, ti) => ti !== techIndex
                                        ),
                                      }
                                    : item
                                ),
                              }))
                            }
                          >
                            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            projects: prev.projects.map((item, i) =>
                              i === index
                                ? { ...item, technologies: [...item.technologies, ""] }
                                : item
                            ),
                          }))
                        }
                      >
                        Add technology
                      </Button>
                    </div>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outline"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                projects: [
                  ...prev.projects,
                  { name: "", description: "", url: "", technologies: [""] },
                ],
              }))
            }
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
            Add project
          </Button>
        </TabsContent>

        <TabsContent value="certifications" className="mt-4 space-y-4">
          {form.certifications.map((cert, index) => (
            <Card key={cert.id ?? index}>
              <CardHeader className="flex flex-row items-start justify-between">
                <CardTitle>Certification {index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      certifications: prev.certifications.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                </Button>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Name</FieldLabel>
                    <Input
                      value={cert.name}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          certifications: prev.certifications.map((item, i) =>
                            i === index ? { ...item, name: e.target.value } : item
                          ),
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Issuer</FieldLabel>
                    <Input
                      value={cert.issuer}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          certifications: prev.certifications.map((item, i) =>
                            i === index ? { ...item, issuer: e.target.value } : item
                          ),
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Issue date</FieldLabel>
                    <Input
                      value={cert.issueDate}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          certifications: prev.certifications.map((item, i) =>
                            i === index ? { ...item, issueDate: e.target.value } : item
                          ),
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>URL</FieldLabel>
                    <Input
                      value={cert.url}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          certifications: prev.certifications.map((item, i) =>
                            i === index ? { ...item, url: e.target.value } : item
                          ),
                        }))
                      }
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outline"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                certifications: [
                  ...prev.certifications,
                  { name: "", issuer: "", issueDate: "", url: "" },
                ],
              }))
            }
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
            Add certification
          </Button>
        </TabsContent>

        <TabsContent value="links" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
              <CardDescription>Your online presence and portfolio links.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="website">Website</FieldLabel>
                  <Input
                    id="website"
                    value={form.website}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, website: e.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="linkedin">LinkedIn</FieldLabel>
                  <Input
                    id="linkedin"
                    value={form.linkedinUrl}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, linkedinUrl: e.target.value }))
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="github">GitHub</FieldLabel>
                  <Input
                    id="github"
                    value={form.githubUrl}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, githubUrl: e.target.value }))
                    }
                  />
                </Field>
                {form.otherLinks.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Label"
                      value={link.label}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          otherLinks: prev.otherLinks.map((item, i) =>
                            i === index ? { ...item, label: e.target.value } : item
                          ),
                        }))
                      }
                    />
                    <Input
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          otherLinks: prev.otherLinks.map((item, i) =>
                            i === index ? { ...item, url: e.target.value } : item
                          ),
                        }))
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          otherLinks: prev.otherLinks.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      otherLinks: [...prev.otherLinks, { label: "", url: "" }],
                    }))
                  }
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                  Add link
                </Button>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end border-t pt-4">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <>
              <Spinner className="mr-2" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </div>
  )
}
