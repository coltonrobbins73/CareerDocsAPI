import React from 'react';
import fs from 'fs';
import path from 'path';
import { Page, Text, View, Document, StyleSheet, Image, Font, renderToBuffer } from '@react-pdf/renderer';

// Register the variable font
Font.register({
  family: 'EB Garamond',
  fonts: [
    { src: 'public/fonts/EBGaramond-Regular.ttf', fontWeight: 400 },
    { src: 'public/fonts/EBGaramond-Bold.ttf', fontWeight: 700 },
    { src: 'public/fonts/EBGaramond-Italic.ttf', fontStyle: 'italic' },
  ]
});

// Constants for styling
const pageMargin = 35;
const footerHeight = 50;
const fontColorPrimary = '#000';
const fontColorSecondary = '#666';

// Create styles
const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    padding: pageMargin,
    paddingBottom: footerHeight,
    fontFamily: 'EB Garamond',
    color: fontColorPrimary
  },
  header: {
    marginBottom: 20
  },
  contactInfo: {
    marginBottom: 10
  },
  date: {
    marginBottom: 20
  },
  address: {
    marginBottom: 20
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10
  },
  body: {
    marginBottom: 20
  },
  paragraph: {
    marginBottom: 10
  },
  signature: {
    marginTop: 20
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginTop: 20,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  }
});

export const writeCoverLetterPDF = async ({hook, body, closing}: {hook: string, body: string, closing: string}): Promise<Buffer> => {
  try {
      const pdfDocument = generatePDFDocument({ hook, body, closing });
      const pdfBuffer = await renderToBuffer(pdfDocument);
      return pdfBuffer;
  } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
  }
};

 const generatePDFDocument = ({hook, body, closing}: {hook: string, body: string, closing: string})  => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Ivan Pedroza</Text>
        <Text>Seattle, WA 98107</Text>
        <Text>(208) 590-5361</Text>
        <Text>Ivan.k.pedroza@gmail.com</Text>
      </View>
      <View style={styles.date}>
        <Text>14 November 2023</Text>
      </View>
      <View style={styles.address}>
        <Text>88 Colin P. Kelly Jr. Street</Text>
        <Text>San Francisco, CA 94107</Text>
      </View>
      <View style={styles.paragraph}>
        <Text>To Whom It May Concern:</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.paragraph}>
          <Text>{hook}</Text>
        </View>
        <View style={styles.paragraph}>
          <Text>
            {body}
          </Text>
        </View>
      </View>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>You Want:</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>I Bring:</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>3+ years of software engineering experience. 2+ years of experience with Git & GitHub</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>A Master’s in Computer Science, 2 years of experience using Git and GitHub.</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Strong 3+ years of experience developing & debugging large scale projects, applications or developer tools. 3+ years of experience interfacing with RESTful APIs & OAuth Workflows.</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>4 years of experience developing large scale solutions for manufacturing and bioinformatics pipelines. Experience interfacing with government database APIs.</Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Strong communication/interpersonal skills both written & verbal. You will write, review & maintain code & technical documentation.</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Proficient in crafting scientific papers for publication and effectively conveying experimental findings on groundbreaking molecular research to collaborating labs and stakeholders.</Text>
          </View>
        </View>
      </View>
      <View style={styles.signature}>
        <Text>{closing + "\n"}</Text>
        <Text>Sincerely,</Text>
        <Text>Ivan Pedroza</Text>
      </View>
    </Page>
  </Document>
);

