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
  section: {
    marginBottom: 10,
  },
  reportText: {
    fontSize: 12,
    lineHeight: 1.5,
  },
});

interface ActivityReportDocumentProps {
  reportText: string;
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
          <Text style={styles.reportText}>{reportText}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ActivityReportDocument;