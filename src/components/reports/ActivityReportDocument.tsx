
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    paddingTop: 35,
    paddingBottom: 65, // Increased padding for footer
    paddingHorizontal: 35,
    fontFamily: 'Helvetica', // Using a standard font
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  logo: {
    width: 120, // Adjust size as needed
    height: 'auto', // Maintain aspect ratio
    marginBottom: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22, // Slightly smaller
    textAlign: 'center',
    marginBottom: 10,
    color: '#333333', // Darker text
    fontWeight: 'bold',
  },
  date: {
    fontSize: 10,
    textAlign: 'right',
    marginBottom: 20,
    color: '#666666',
  },
  section: {
    marginBottom: 15,
  },
  heading: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#4A90E2', // Primary-like color
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    paddingBottom: 3,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 10,
    textAlign: 'justify',
    color: '#333333',
  },
  listItem: {
    fontSize: 11,
    lineHeight: 1.6,
    marginLeft: 15,
    marginBottom: 5,
    color: '#333333',
  },
  list: {
    marginBottom: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 35,
    right: 35,
    textAlign: 'center',
    color: 'grey',
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#AAAAAA',
    paddingTop: 5,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 15,
    left: 0,
    right: 35,
    textAlign: "right",
    color: 'grey',
  },
});

interface ActivityReportDocumentProps {
  reportText: {
    executiveSummary: string;
    keyHighlights: string[];
    conclusions: string[];
    recommendations: string[];
  } | null;
}

const ActivityReportDocument: React.FC<ActivityReportDocumentProps> = ({ reportText }) => {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <Document title="Informe de Actividad AlpriNexus" author="AlpriNexus">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {/* 
            Para que la imagen funcione, `/width_800.png` debe ser accesible públicamente.
            En un entorno de desarrollo local, esto usualmente significa que está en la carpeta `public`.
            Si la generación del PDF ocurre en un contexto sin acceso al servidor web (ej. serverless function sin acceso a assets),
            se necesitaría un URL absoluto a la imagen o la imagen como Data URI.
            Por ahora, asumimos que el contexto de renderizado puede acceder a `/width_800.png`.
          */}
          <Image
            style={styles.logo}
            src="/width_800.png" // Asumiendo que está en public/width_800.png
          />
          <Text style={styles.title}>Informe de Actividad de la Plataforma AlpriNexus</Text>
          <Text style={styles.date}>Generado el: {currentDate}</Text>
        </View>

        {reportText ? (
          <>
            <View style={styles.section}>
              <Text style={styles.heading}>1. Resumen Ejecutivo</Text>
              <Text style={styles.paragraph}>{reportText.executiveSummary}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.heading}>2. Puntos Clave Destacados</Text>
              <View style={styles.list}>
                {reportText.keyHighlights.map((item, index) => (
                  <Text key={`highlight-${index}`} style={styles.listItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.heading}>3. Conclusiones</Text>
              <View style={styles.list}>
                {reportText.conclusions.map((item, index) => (
                  <Text key={`conclusion-${index}`} style={styles.listItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.heading}>4. Recomendaciones</Text>
              <View style={styles.list}>
                {reportText.recommendations.map((item, index) => (
                  <Text key={`recommendation-${index}`} style={styles.listItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <Text style={styles.paragraph}>Generando contenido del informe...</Text>
          </View>
        )}

        <Text style={styles.footer} fixed>
          AlpriNexus - Una iniciativa de Alprigrama S.A.S. &copy; {new Date().getFullYear()}
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

export default ActivityReportDocument;
