import PDFDocument from "pdfkit";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import * as visitorModel from "../models/visitor.model.js"
import { asyncHandler, ok, fail } from "../utils/response.js"

const STATUS_LABELS = {
  "0": "pending",
  "1": "active",
  "2": "blocked",
  "3": "deleted",
}

export const checkVisitorExists = asyncHandler(async (req, res) => {
  const visitorId = Number(req.params.visitor_id)
  const row = await visitorModel.visitorExists(visitorId)
  if (!row) return ok(res, { visitor_id: visitorId, exists: false })
  return ok(res, {
    visitor_id: row.customers_id,
    exists: true,
    registration_status: STATUS_LABELS[row.status] ?? row.status,
    guest_type: row.guest_type,
  })
})

export const getVisitor = asyncHandler(async (req, res) => {
  const visitorId = Number(req.params.visitor_id)
  const visitor = await visitorModel.findVisitorById(visitorId)
  if (!visitor) return fail(res, 404, "Visitor not found", "E_VISITOR_NOT_FOUND")

  // const host = req.get("host").split(":")[0]
  // const BASE_URL = `${req.protocol}://${host}`
  const BASE_URL = `http://bkdbnewanubhavmantap.in`

  const { password, otp_code, actkey, user_uq_token, customer_qr, ...safe } = visitor


  return ok(res, { safe, visitor_qr: customer_qr ? `${BASE_URL}/uploaded_files/qr/${customer_qr}` : `${BASE_URL}/uploaded_files/no_qr.svg` })
})

export const getVisitors = asyncHandler(async (req, res) => {
  const { limit, offset } = req.validatedQuery
  const { rows, total } = await visitorModel.findAllVisitors(limit, offset)

  // const host = req.get("host").split(":")[0]
  // const BASE_URL = `${req.protocol}://${host}`
  const BASE_URL = `http://bkdbnewanubhavmantap.in`

  const items = rows.map(
    ({
      password,
      otp_code,
      actkey,
      user_uq_token,
      customer_qr,
      image1,
      image2,
      image3,
      ...safe
    }) => ({
      ...safe,

      visitor_qr: customer_qr
        ? `${BASE_URL}/uploaded_files/qr/${customer_qr}`
        : `${BASE_URL}/uploaded_files/no-image.png`,

      image1_url: image1
        ? `${BASE_URL}/uploaded_files/visitors/${image1}`
        : `${BASE_URL}/uploaded_files/no-image.png`,

      image2_url: image2
        ? `${BASE_URL}/uploaded_files/visitors/${image2}`
        : `${BASE_URL}/uploaded_files/no-image.png`,

      image3_url: image3
        ? `${BASE_URL}/uploaded_files/visitors/${image3}`
        : `${BASE_URL}/uploaded_files/no-image.png`,
    }),
  )

  return ok(res, { count: items.length, total, limit, offset, items })
})

export const getVisitorImage = asyncHandler(async (req, res) => {
  const visitorId = Number(req.params.visitor_id)
  const idx = Number(req.params.image_index)

  const row = await visitorModel.findVisitorImages(visitorId)

  if (!row)
    return fail(res, 404, "Visitor not found", "E_VISITOR_NOT_FOUND")

  // const host = req.get("host").split(":")[0]
  // const BASE_URL = `${req.protocol}://${host}`

  const BASE_URL = `http://bkdbnewanubhavmantap.in`

  const images = [row.image1, row.image2, row.image3]
  const image = images[idx]

  if (!image)
    return fail(res, 404, "Image not found", "E_IMAGE_NOT_FOUND")

  return ok(res, {
    visitor_id: visitorId,
    image_index: idx,
    image_url: image ? `${BASE_URL}/uploaded_files/visitors/${image}` : `${BASE_URL}/uploaded_files/no-image.png`,
  })
})

export const getVisitorIdCard = asyncHandler(async (req, res) => {
  const visitorId = Number(req.params.visitor_id)

  const row = await visitorModel.visitorIdCard(visitorId)

  console.log("ID Card Row:", row) // Debug log to check the retrieved data

  if (!row)
    return fail(res, 404, "Visitor not found", "E_VISITOR_NOT_FOUND")

  // const host = req.get("host").split(":")[0]
  // const BASE_URL = `${req.protocol}://${host}`
  const BASE_URL = `http://bkdbnewanubhavmantap.in`

  return ok(res, {
    visitor_id: row.visitor_id,
    name: row.name,
    mobile_number: row.mobile_number,
    blood_group: row.blood_group,
    age: row.age,
    illness: row.illness,
    image_url: row.image ? `${BASE_URL}/uploaded_files/visitors/${row.image}` : `${BASE_URL}/uploaded_files/no-image.png`,
    qr_image_url: row.visitor_qr ? `${BASE_URL}/uploaded_files/qr/${row.visitor_qr}` : `${BASE_URL}/uploaded_files/no-image.png`,
  })
})

export const downloadVisitorIdCard = asyncHandler(async (req, res) => {
  const visitorId = Number(req.params.visitor_id);

  const row = await visitorModel.visitorIdCard(visitorId);

  if (!row) {
    return fail(
      res,
      404,
      "Visitor not found",
      "E_VISITOR_NOT_FOUND"
    );
  }

  const BASE_URL = "http://bkdbnewanubhavmantap.in";

  const profileImage = row.image
    ? `${BASE_URL}/uploaded_files/visitors/${row.image}`
    : `${BASE_URL}/uploaded_files/no-image.png`;

  const qrImage = row.visitor_qr
    ? `${BASE_URL}/uploaded_files/qr/${row.visitor_qr}`
    : `${BASE_URL}/uploaded_files/no-image.png`;

  // Update with your actual logo path
  const logoImage = `https://wlproject.weblink4you.com/bharathapp_technology/assets/designer/themes/default/images/logo.jpg`;

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@page{
    size:340px 520px;
    margin:0;
}

*{
    box-sizing:border-box;
    margin:0;
    padding:0;
}

html,
body{
    width:340px;
    height:520px;
    margin:0;
    padding:0;
    overflow:hidden;
    font-family:Arial,sans-serif;
}

.card{
    width:340px;
    height:520px;
    background:#f5f5f5;
    border-radius:24px;
    overflow:hidden;
    position:relative;
}

.visitor-id{
    position:absolute;
    right:15px;
    top:15px;
    font-size:16px;
    font-weight:700;
    color:#000;
}

.logo{
    position:absolute;
    left:25px;
    top:70px;
    width:80px;
    height:80px;
    object-fit:contain;
}

.profile{
    position:absolute;
    right:25px;
    top:75px;
    width:120px;
    height:120px;
    object-fit:cover;
    border-radius:20px;
    border:4px solid rgba(255,255,255,.7);
}

.bottom{
    position:absolute;
    left:0;
    right:0;
    bottom:0;
    width:100%;
    height:310px;
    background:#334f8b;
    border-bottom-left-radius:24px;
    border-bottom-right-radius:24px;
    overflow:hidden;
}

.wave{
    position:absolute;
    top:-55px;
    left:0;
    width:100%;
    height:80px;
}

.details{
    position:absolute;
    top:60px;
    left:15px;
    color:#fff;
    width:170px;
}

.name-title{
    font-size:32px;
    font-weight:700;
    margin-bottom:18px;
}

.row{
    display:flex;
    margin-bottom:8px;
    font-size:13px;
}

.label{
    width:60px;
    font-weight:700;
}

.value{
    flex:1;
}

.qr-box{
    position:absolute;
    right:20px;
    bottom:55px;
    width:95px;
    height:95px;
    background:#fff;
    padding:8px;
    display:flex;
    justify-content:center;
    align-items:center;
}

.qr-box img{
    width:100%;
    height:100%;
    object-fit:contain;
}
</style>
</head>
<body>

<div class="card">

<div class="visitor-id">
Visitor ID : ${row.visitor_id}
</div>

<img src="${logoImage}" class="logo">

<img src="${profileImage}" class="profile">

<div class="bottom">

<!-- BEFORE -->
<svg class="wave" viewBox="0 0 500 100" preserveAspectRatio="none">
  <path d="M0,80 C150,10 350,10 500,70 L500,100 L0,100 Z" fill="#334f8b"/>
</svg>

<!-- AFTER -->
<svg class="wave" viewBox="0 0 500 50" preserveAspectRatio="none">
  <path d="M0,50 L0,40 C150,5 350,5 500,35 L500,50 Z" fill="#334f8b"/>
</svg>

<div class="details">

<div class="name-title">
${row.name || ""}
</div>

<div class="row">
<div class="label">Name:</div>
<div class="value">${row.name || "-"}</div>
</div>

<div class="row">
<div class="label">Mobile:</div>
<div class="value">${row.mobile_number || "-"}</div>
</div>

<div class="row">
<div class="label">Blood Group:</div>
<div class="value">${row.blood_group || "-"}</div>
</div>

<div class="row">
<div class="label">AGE:</div>
<div class="value">${row.age || "-"}</div>
</div>

<div class="row">
<div class="label">Illness:</div>
<div class="value">${row.illness || "-"}</div>
</div>

</div>

<div class="qr-box">
  ${qrImage
      ? `<img src="${qrImage}" />`
      : `<span>QR Code</span>`
    }
</div>

</div>

</div>

</body>
</html>
`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  const pdfBuffer = await page.pdf({
    width: "340px",
    height: "520px",
    printBackground: true,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  });

  await browser.close();

  const now = new Date();

  const timestamp =
    `${now.getFullYear()}-` +
    `${String(now.getMonth() + 1).padStart(2, "0")}-` +
    `${String(now.getDate()).padStart(2, "0")}-` +
    `${String(now.getHours()).padStart(2, "0")}-` +
    `${String(now.getMinutes()).padStart(2, "0")}-` +
    `${String(now.getSeconds()).padStart(2, "0")}`;

  const fileName = `idcard_${visitorId}_${timestamp}.pdf`;

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${fileName}"`,
    "Content-Length": pdfBuffer.length,
  });

  res.end(pdfBuffer);
});