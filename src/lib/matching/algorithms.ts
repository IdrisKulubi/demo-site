import { Profile } from "@/db/schema";

type ValidGender = "male" | "female" | "non-binary" | "other";

export interface MatchingCriteria {
  genderPreferences: {
    male: ValidGender[];
    female: ValidGender[];
    "non-binary": ValidGender[];
    other: ValidGender[];
  };
  courseCompatibility: Record<string, string[]>;
  minCommonInterests: number;
}

export const defaultCriteria: MatchingCriteria = {
  genderPreferences: {
    male: ["female", "non-binary", "other"],
    female: ["male", "non-binary", "other"],
    "non-binary": ["male", "female", "non-binary", "other"],
    other: ["male", "female", "non-binary", "other"],
  },
  courseCompatibility: {
    "computer-science": ["business", "design", "engineering"],
    business: ["computer-science", "communications"],
    engineering: ["computer-science", "architecture"],
  },
  minCommonInterests: 2,
};

export function calculateCompatibility(
  user: Profile,
  target: Profile,
  criteria: MatchingCriteria = defaultCriteria
): boolean {
  // Gender compatibility check
  const validGenders =
    criteria.genderPreferences[(user.gender || "other") as ValidGender] || [];
  if (!validGenders.includes((target.gender || "other") as ValidGender))
    return false;

  // Course compatibility check
  const compatibleCourses =
    criteria.courseCompatibility[user.course?.toLowerCase() || ""] || [];
  const targetCourse = target.course?.toLowerCase() || "";
  const courseMatch = compatibleCourses.includes(targetCourse);

  // Common interests check
  const commonInterests = (user.interests || []).filter((interest) =>
    (target.interests || []).includes(interest)
  ).length;

  return courseMatch && commonInterests >= criteria.minCommonInterests;
}
