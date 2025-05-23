
import { FileUploader } from "@/components/uploads/file-uploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Gestionar Recursos</CardTitle>
          <CardDescription>
            Sube y gestiona los materiales de tu curso, documentos, videos y otros recursos.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <FileUploader />

      <Card>
        <CardHeader>
            <CardTitle>Mis Archivos Subidos</CardTitle>
            <CardDescription>La lista de archivos subidos anteriormente aparecerá aquí.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-center py-8">
                Aún no se han subido archivos. Utiliza el cargador de arriba para añadir tu primer recurso.
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
