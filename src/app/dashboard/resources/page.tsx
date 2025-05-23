import { FileUploader } from "@/components/uploads/file-uploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Manage Resources</CardTitle>
          <CardDescription>
            Upload and manage your course materials, documents, videos, and other resources.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <FileUploader />

      <Card>
        <CardHeader>
            <CardTitle>My Uploaded Files</CardTitle>
            <CardDescription>List of previously uploaded files will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-center py-8">
                No files uploaded yet. Use the uploader above to add your first resource.
            </p>
            {/* Placeholder for listing uploaded files */}
            {/* Example:
            <Table>
              <TableHeader>...</TableHeader>
              <TableBody>...</TableBody>
            </Table>
            */}
        </CardContent>
      </Card>
    </div>
  );
}
