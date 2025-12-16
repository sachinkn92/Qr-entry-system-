import React, { useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import "../App.css"; // reuse main styling

export default function ManufacturerForm() {
  const [form, setForm] = useState({
    companyName: "",
    address: "",
    productID: "",
    productName: "",
    brand: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registerProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // backend will add timestamp and hash
      const res = await axios.post("http://localhost:5000/mfg/products", {
        companyName: form.companyName,
        address: form.address,
        productID: form.productID,
        productName: form.productName,
        brand: form.brand
      });
      setResult(res.data);
    } catch (err) {
      setResult({
        success: false,
        error: err.response?.data?.error || err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const qrText = result?.success ? result.qrText : null;

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="logo-mark">TT</div>
        <div className="header-text">
          <h1>TrueTrace – Manufacturer Console</h1>
          <p className="subtitle">
            Register product origins and generate QR codes backed by blockchain.
          </p>
        </div>
      </header>

      <main className="main-layout">
        <section className="card">
          <h2>Manufacturer Portal</h2>
          <p className="section-desc">
            Enter company and product details. TrueTrace will timestamp,
            generate the QR payload, hash it, and store the hash on-chain.
          </p>

          <form className="form" onSubmit={registerProduct}>
            <label>
              Company Name
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Address
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Product ID
              <input
                type="text"
                name="productID"
                value={form.productID}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Product Name
              <input
                type="text"
                name="productName"
                value={form.productName}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Brand
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                required
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register & Generate QR"}
            </button>
          </form>

          {result && (
            <div className="result-panel">
              {result.success ? (
                <>
                  <p className="status success">
                    Product registered on blockchain successfully.
                  </p>
                  <p>
                    Timestamp:{" "}
                    <span className="mono">{result.timestamp}</span>
                  </p>
                  <p>
                    Transaction Hash:{" "}
                    <span className="mono">
                      {result.txHash.substring(0, 18)}...
                    </span>
                  </p>
                  <p>
                    QR Hash (on-chain):{" "}
                    <span className="mono">
                      {result.qrHash.substring(0, 24)}...
                    </span>
                  </p>
                </>
              ) : (
                <p className="status error">Error: {result.error}</p>
              )}
            </div>
          )}
        </section>

        <section className="card">
          <h2>Product QR Code</h2>
          <p className="section-desc">
            This QR encodes all manufacturer details. When scanned with Google
            Lens, customers see the full text.
          </p>

        try {
      // backend will add timestamp and hash
      const res = await axios.post("http://localhost:5000/mfg/products", {
        companyName: form.companyName,
        address: form.address,
        productID: form.productID,
        productName: form.productName,
        brand: form.brand
      });
      setResult(res.data);
    } catch (err) {
      setResult({
        success: false,
        error: err.response?.data?.error || err.message
      });
    } finally {
      setLoading(false);
    }
  };
          ) : (
            <p className="section-desc">
              Register a product to generate its QR code.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
try {
      // backend will add timestamp and hash
      const res = await axios.post("http://localhost:5000/mfg/products", {
        companyName: form.companyName,
        address: form.address,
        productID: form.productID,
        productName: form.productName,
        brand: form.brand
      });
      setResult(res.data);
    } catch (err) {
      setResult({
        success: false,
        error: err.response?.data?.error || err.message
      });
    } finally {
      setLoading(false);
    }
  };try {
      // backend will add timestamp and hash
      const res = await axios.post("http://localhost:5000/mfg/products", {
        companyName: form.companyName,
        address: form.address,
        productID: form.productID,
        productName: form.productName,
        brand: form.brand
      });
      setResult(res.data);
    } catch (err) {
      setResult({
        success: false,
        error: err.response?.data?.error || err.message
      });
    } finally {
      setLoading(false);
    }
  };

class Solution:
    def findMedianSortedArrays(self, nums1, nums2):
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1
        
        low, high = 0, len(nums1)
        
        while low <= high:
            cut1 = (low + high) // 2
            cut2 = (len(nums1) + len(nums2) + 1) // 2 - cut1
            
            left1 = float('-inf') if cut1 == 0 else nums1[cut1 - 1]
            left2 = float('-inf') if cut2 == 0 else nums2[cut2 - 1]
            right1 = float('inf') if cut1 == len(nums1) else nums1[cut1]
            right2 = float('inf') if cut2 == len(nums2) else nums2[cut2]
            
            if left1 <= right2 and left2 <= right1:
                if (len(nums1) + len(nums2)) % 2 == 0:
                    return (max(left1, left2) + min(right1, right2)) / 2.0
                else:
                    return float(max(left1, left2))
            elif left1 > right2:
                high = cut1 - 1
            else:
                low = cut1 + 1
