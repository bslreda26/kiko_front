import React, { useState } from "react";
import { motion } from "framer-motion";
import { testConnection } from "../services/authService";
import { getAllProducts } from "../services/productService";
import { getAllCollections } from "../services/collectionService";

const ApiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true);
    try {
      const result = await testFn();
      setTestResults((prev: any) => ({
        ...prev,
        [testName]: { success: true, data: result },
      }));
    } catch (error: any) {
      setTestResults((prev: any) => ({
        ...prev,
        [testName]: { success: false, error: error.message },
      }));
    }
    setLoading(false);
  };

  const tests = [
    {
      name: "Connection Test",
      fn: () => testConnection(),
      description: "Test basic connection to backend",
    },
    {
      name: "Get Collections",
      fn: () => getAllCollections(),
      description: "Fetch all collections from API",
    },
    {
      name: "Get Products",
      fn: () => getAllProducts(),
      description: "Fetch all products from API",
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        zIndex: 9999,
        maxWidth: "400px",
        maxHeight: "80vh",
        overflow: "auto",
      }}
    >
      <h3 style={{ marginBottom: "15px", fontSize: "18px" }}>API Test Panel</h3>

      {tests.map((test) => (
        <div key={test.name} style={{ marginBottom: "15px" }}>
          <motion.button
            onClick={() => runTest(test.name, test.fn)}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: "100%",
              padding: "10px",
              background: loading ? "#ccc" : "#64748b",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "5px",
            }}
          >
            {loading ? "Testing..." : `Test ${test.name}`}
          </motion.button>

          <p style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
            {test.description}
          </p>

          {testResults[test.name] && (
            <div
              style={{
                padding: "10px",
                borderRadius: "5px",
                fontSize: "12px",
                background: testResults[test.name].success
                  ? "#d4edda"
                  : "#f8d7da",
                color: testResults[test.name].success ? "#155724" : "#721c24",
                border: `1px solid ${
                  testResults[test.name].success ? "#c3e6cb" : "#f5c6cb"
                }`,
              }}
            >
              {testResults[test.name].success ? (
                <div>
                  <strong>✅ Success!</strong>
                  <pre
                    style={{
                      marginTop: "5px",
                      fontSize: "11px",
                      overflow: "auto",
                    }}
                  >
                    {JSON.stringify(testResults[test.name].data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div>
                  <strong>❌ Error:</strong>
                  <p style={{ marginTop: "5px" }}>
                    {testResults[test.name].error}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ApiTest;
