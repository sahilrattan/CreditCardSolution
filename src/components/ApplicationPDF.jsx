import React from "react";
import { Page, Text, View, Document, StyleSheet, PDFViewer } from "@react-pdf/renderer";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40
  },
  header: {
    marginBottom: 20,
    textAlign: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    borderBottom: "1px solid #000",
    paddingBottom: 5
  },
  row: {
    flexDirection: "row",
    marginBottom: 5
  },
  label: {
    width: "40%",
    fontSize: 12,
    fontWeight: "bold"
  },
  value: {
    width: "60%",
    fontSize: 12
  },
  footer: {
    marginTop: 30,
    fontSize: 10,
    textAlign: "center"
  }
});

// Create Document Component
const ApplicationPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Credit Card Application</Text>
        <Text style={styles.subtitle}>{data.cardType}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Application ID:</Text>
          <Text style={styles.value}>{data.id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{data.status}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date Submitted:</Text>
          <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Full Name:</Text>
          <Text style={styles.value}>{data.fullName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{data.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{data.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date of Birth:</Text>
          <Text style={styles.value}>{new Date(data.dob).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{data.address}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>City:</Text>
          <Text style={styles.value}>{data.city}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>State:</Text>
          <Text style={styles.value}>{data.state}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pincode:</Text>
          <Text style={styles.value}>{data.pincode}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Employment Type:</Text>
          <Text style={styles.value}>{data.employment}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Company Name:</Text>
          <Text style={styles.value}>{data.company}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Annual Income:</Text>
          <Text style={styles.value}>₹{parseFloat(data.income).toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>PAN Number:</Text>
          <Text style={styles.value}>{data.pan}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>This document is generated for reference purposes only</Text>
        <Text>© {new Date().getFullYear()} Credit Card Services</Text>
      </View>
    </Page>
  </Document>
);

export default ApplicationPDF;