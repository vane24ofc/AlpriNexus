import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  date: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 20,
  },
  section: { // Keep general section style for spacing
    marginBottom: 10,
  },
  heading: { // New style for section headings
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold', // Add bold for headings
  },
  paragraph: { // Style for the executive summary and potentially other single blocks
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 10, // Add margin after paragraphs
  },
  listItem: { // Style for list items
    fontSize: 12,
    lineHeight: 1.5,
    marginLeft: 10, // Indent list items
    marginBottom: 5, // Space between list items
  },
  list: { // Style for the list container
    marginBottom: 10, // Space after the entire list
  },
});

interface ActivityReportDocumentProps {
  reportText: {
    executiveSummary: string;
    keyHighlights: string[];
    conclusions: string[];
    recommendations: string[];
  } | null; // Allow reportText to be null initially
}

const ActivityReportDocument: React.FC<ActivityReportDocumentProps> = ({ reportText }) => {
  const currentDate = new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Informe de Actividad</Text>
          <Text style={styles.date}>Fecha: {currentDate}</Text>
        </View>
        <View style={styles.section}>
          {reportText ? (
            <>
              <Text style={styles.heading}>Resumen Ejecutivo</Text>
              <Text style={styles.paragraph}>{reportText.executiveSummary}</Text>

              <Text style={styles.heading}>Puntos Clave Destacados</Text>
              <View style={styles.list}>
                {reportText.keyHighlights.map((item, index) => (
                  <Text key={index} style={styles.listItem}>
                    • {item} {/* Add a bullet point */}
                  </Text>
                ))}
              </View>

              <Text style={styles.heading}>Conclusiones</Text>
              <View style={styles.list}>
                {reportText.conclusions.map((item, index) => (
                  <Text key={index} style={styles.listItem}>
                    • {item}
                  </Text>
                ))}
              </View>

              <Text style={styles.heading}>Recomendaciones</Text>
              <View style={styles.list}>
                {reportText.recommendations.map((item, index) => (
                  <Text key={index} style={styles.listItem}>
                    • {item}</Text> // Use a single bullet point style
                ))}
              </View>
            </>
          ) : (
            <Text>Cargando informe...</Text> // Or a better loading indicator within the PDF context if needed
          )}
        </View>
      </Page>
    </Document>
  );
};

export default ActivityReportDocument;