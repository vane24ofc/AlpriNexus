
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    paddingTop: 35,
    paddingBottom: 65, // Increased padding for footer
    paddingHorizontal: 35,
    fontFamily: 'Helvetica', // Standard font
  },
  header: {
    marginBottom: 25, // Increased bottom margin
    textAlign: 'center',
  },
  logo: {
    width: 100, // Slightly smaller logo
    height: 'auto',
    marginBottom: 15, // Increased space after logo
    alignSelf: 'center',
  },
  title: {
    fontSize: 20, // Slightly reduced for better balance
    textAlign: 'center',
    marginBottom: 8, // Reduced space before date
    color: '#1a1a1a', // Very dark gray, almost black
    fontWeight: 'bold',
  },
  date: {
    fontSize: 10,
    textAlign: 'center', // Centered date
    marginBottom: 25, // Increased space after date
    color: '#555555', // Darker gray for date
  },
  section: {
    marginBottom: 20, // Increased space between sections
  },
  heading: {
    fontSize: 15, // Slightly smaller heading
    marginBottom: 10, // Increased space after heading
    fontWeight: 'bold',
    color: '#2d2d2d', // Dark gray for headings (instead of blue)
    borderBottomWidth: 0.5, // Thinner border
    borderBottomColor: '#cccccc', // Lighter border color
    paddingBottom: 4, // Slightly more padding
  },
  paragraph: {
    fontSize: 10.5, // Slightly smaller body text for denser content
    lineHeight: 1.65, // Adjusted line height
    marginBottom: 8, // Consistent paragraph spacing
    textAlign: 'justify',
    color: '#333333',
  },
  listItem: {
    fontSize: 10.5,
    lineHeight: 1.65,
    marginLeft: 18, // Slightly increased indent for list items
    marginBottom: 6, // Consistent list item spacing
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
    color: '#666666', // Consistent footer color
    fontSize: 9,
    borderTopWidth: 0.5, // Thinner border
    borderTopColor: '#cccccc', // Lighter border
    paddingTop: 8, // Increased padding for footer
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 15, // Standardized position
    left: 0,
    right: 35,
    textAlign: "right",
    color: '#666666',
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
          {/* Ensure /width_800.png is in your public folder for this to work */}
          <Image
            style={styles.logo}
            src="/width_800.png"
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
