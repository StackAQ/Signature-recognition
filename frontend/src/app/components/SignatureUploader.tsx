'use client'

import { useState, useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import axios from 'axios'

export default function SignatureVerifier() {
  const [mode, setMode] = useState<'draw' | 'upload'>('draw')
  const [original, setOriginal] = useState<File | null>(null)
  const [test, setTest] = useState<File | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const sigCanvasRef = useRef<SignatureCanvas>(null)

  const handleCompare = async () => {
    const formData = new FormData()

    if (!original) return alert('Upload original signature!')
    formData.append('original', original)

    if (mode === 'upload') {
      if (!test) return alert('Upload test signature!')
      formData.append('test', test)
    } else {
      const drawn = sigCanvasRef.current?.toDataURL()
      const blob = await (await fetch(drawn!)).blob()
      formData.append('test', new File([blob], 'drawn.png', { type: 'image/png' }))
    }

    try {
  const res = await fetch("https://signature-recognition-0n3m.onrender.com/api/verify", {
    method: "POST",
    body: formData,
  })

  const data = await res.json()
  setResult(data.match_score >= 50 ? '✅ Match' : '❌ No Match')
} catch (err) {
  setResult('❌ Error verifying signature')
}
  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-xl rounded-2xl space-y-6">
      <h1 className="text-2xl font-bold text-center text-gray-800">Signature Verification</h1>

      {/* Mode Selector */}
      <div>
        <label className="block font-semibold text-gray-700 mb-1">Test Signature Input Method</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as 'draw' | 'upload')}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="draw">✍️ Draw Test Signature</option>
          <option value="upload">📁 Upload Test Signature</option>
        </select>
      </div>

      {/* Upload Original Signature */}
      <div>
        <label className="block font-semibold text-gray-700 mb-1">Original Signature</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setOriginal(e.target.files?.[0] || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Draw or Upload Test Signature */}
      {mode === 'draw' ? (
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Draw Test Signature</label>
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <SignatureCanvas
              ref={sigCanvasRef}
              penColor="black"
              canvasProps={{ width: 300, height: 150, className: 'bg-white' }}
            />
          </div>
          <button
            onClick={() => sigCanvasRef.current?.clear()}
            className="mt-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            🧹 Clear
          </button>
        </div>
      ) : (
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Upload Test Signature</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setTest(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      )}

      {/* Compare Button */}
      <button
        onClick={handleCompare}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
      >
        🔍 Compare Signatures
      </button>

      {/* Result */}
      {result && (
        <div className="text-center text-lg font-semibold text-gray-800 mt-2">
          {result}
        </div>
      )}
    </div>
  )
}