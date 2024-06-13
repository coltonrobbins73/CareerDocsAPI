import React, { ReactElement } from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

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
    fontFamily: 'Helvetica',
    color: fontColorPrimary
  },
  container: {
    margin: 10,
    border: 0.5,
    borderColor: 'black',
    height: 135,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingLeft: 20,
    paddingBottom: 10
  },
  subtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingLeft: 20,
  },
  logo: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    margin: 0,
    width: 150,
    height: 40,
    paddingBottom: 15
  },  
  text: {
    marginLeft: 10,
    paddingBottom: 2,
  },
  date: {
    padding: 10 ,
    fontSize: 15,
    fontWeight: 'bold',
  },
  paragraph: {
    paddingLeft: 20,
  },
  inLineContainer: {
    flexDirection: 'row', // This makes the children (View and Text) align horizontally
    alignItems: 'center', // This centers the children vertically in the container
    justifyContent: 'flex-start', // This makes the children spread out in the container
  },
  checkboxSection: {
    display: 'flex',
    flexDirection: 'row',
    margin: 10,
    alignItems: 'center'
  },
  parenthesisText: {
    marginLeft: 10,
    marginBottom: 5,
    fontSize: 6,
    color: fontColorSecondary
  },
  checkbox: {
    width: 10,
    height: 10,
    border: '1px solid black',
    marginRight: 5
  },
  checkboxLabel: {
    fontSize: 10
  },
  underline: {
    flex: 1, // Take up all available space
    height: 0.5, // Height of the underline to represent the signature line
    backgroundColor: 'black', // Color of the underline
    marginRight: 20,
    marginLeft: 10,
    justifyContent: 'flex-end',
    lineHeight: 24,
  }
});

const generateDate =  () => {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];
  return formattedDate;
};

const Container = ({ children, height, justify }: { children: ReactElement | ReactElement[], height?: number, justify?: "flex-start" | "flex-end" | "center" | "space-around" | "space-between" | "space-evenly" | undefined }) => (
  <View style={{ ...styles.container, height: height || styles.container.height, justifyContent: justify || styles.container.justifyContent }}>
    {children}
  </View>
);

const Title = ({ text }: { text: string }) => (
    <View style={styles.title}>
        <Text>{text}</Text>
    </View>
);

const SubTitle = ({ text }: { text: string }) => (
    <View style={styles.subtitle}>
        <Text>{text}</Text>
    </View>
);

const Paragraph = ({ children }: { children: string | string[] }) => (
    <View style={styles.paragraph}>
        <Text>{children}</Text>
    </View>
)

const Gap = () => (
    <View style={{ marginTop: 10, marginBottom: 10 }}></View>
)


// Create Document Component
export const writeCoverLetterPDF = ({hook, body}: {hook: string, body: string})=> (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text>Dear Hiring Manager</Text>
      <Gap />
      <Paragraph>{hook}</Paragraph>
      <Gap />
      <Paragraph>{body}</Paragraph>
      <Gap />
      <Text>Sincerely,</Text>
      <Text>Ivan Pedroza</Text>
    </Page>
  </Document>
);