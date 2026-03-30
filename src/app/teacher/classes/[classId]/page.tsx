import { TeacherClassStudentsPage } from "@/features/teacher/components/teacher-class-students-page";

type TeacherClassStudentsRouteProps = {
  params: Promise<{
    classId: string;
  }>;
};

export default async function TeacherClassStudentsRoute({
  params,
}: TeacherClassStudentsRouteProps) {
  const { classId } = await params;

  return <TeacherClassStudentsPage classId={classId} />;
}
