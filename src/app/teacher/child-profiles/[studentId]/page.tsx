import { TeacherChildProfilePageContent } from "@/features/teacher/components/teacher-child-profile-page";

type ChildProfileRouteProps = {
  params: Promise<{
    studentId: string;
  }>;
};

export default async function ChildProfileDynamicPage({
  params,
}: ChildProfileRouteProps) {
  const { studentId } = await params;
  return <TeacherChildProfilePageContent studentId={studentId} />;
}
