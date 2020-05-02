const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp()
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
const UUID = require("uuid-v4");
// const { Storage } = require('@google-cloud/storage');
// const gcs = require('@google-cloud/storage')();

import * as unzipper from 'unzipper';


exports.generateThumbnail = functions.storage.object().onFinalize(async (object: any) => {

  const fileBucket = object.bucket; // The Storage bucket that contains the file.
  const filePath = object.name; // File path in the bucket.
  const contentType = object.contentType; // File content type.
  // const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.
  // Exit if this is triggered on a file that is not an image.
  console.log("fileBucket::", fileBucket, "filePath", filePath);
  if (!contentType.startsWith('image/')) {
    console.log('This is not an image.', contentType);
    return null;
  }

  // Get the file name.
  const fileName = path.basename(filePath);
  // Exit if the image is already a thumbnail.
  // const pathAr = filePath.split('/');
  if (filePath.indexOf("art") === -1) {
    console.log("not in art");
    return null;
  }
  if (fileName.startsWith('thumb_')) {
    console.log('Already a Thumbnail.');
    return null;
  }
  const bucket = admin.storage().bucket(fileBucket);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const uuid = UUID();
  const metadata = {
    contentType: contentType,
    metadata:{firebaseStorageDownloadTokens: uuid}
  };
  await bucket.file(filePath).download({ destination: tempFilePath });
  console.log('Image downloaded locally to', tempFilePath);
  // Generate a thumbnail using ImageMagick.
  await spawn('convert', [tempFilePath, '-thumbnail', '200x200>', tempFilePath]);
  console.log('Thumbnail created at', tempFilePath);
  // We add a 'thumb_' prefix to thumbnails file name. That's where we'll upload the thumbnail.
  const thumbFileName = `thumb_${fileName}`;
  const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
  // Uploading the thumbnail.
  const uploadresult = await bucket.upload(tempFilePath, {
    destination: thumbFilePath,
    uploadType: "media",
    metadata: metadata,
  });

  console.log("uploadresult",uploadresult)
  const file = uploadresult[0]
  console.log("file.name",file.name)
  const img_url = 'https://firebasestorage.googleapis.com/v0/b/' + fileBucket + '/o/'
  + encodeURIComponent(file.name)
  + '?alt=media&token='
  + metadata.metadata.firebaseStorageDownloadTokens;
  console.log("img_url",img_url)
  const nameAr = file.name.split('/');
  const usersIndex = nameAr.indexOf('users');
  const assetId = nameAr[usersIndex + 3]
  console.log("nameAr", nameAr);
  const userId = nameAr[usersIndex + 1];
  const data = {
    thumb: img_url,
  };
  const refPath = "users/" + userId + '/art/' + assetId;
  const db = admin.database();
  const artRef = db.ref(refPath);
  console.log("saving data to db refPath, data,img_url", refPath, data, img_url);
  artRef.update(data);
  // "https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid
  // Once the thumbnail has been uploaded delete the local file to free up disk space.
  return fs.unlinkSync(tempFilePath);
});

export const manageZipArchives = functions
  .runWith({ timeoutSeconds: 300 })
  .storage.bucket()
  .object()
  .onFinalize(async (obj: any) => {//functions.storage.ObjectMetadata
    // console.log("manageZipArchives obj", obj)
    const fileBucket = obj.bucket; // The Storage bucket that contains the file.
    const filePath = obj.name; // File path in the bucket.
    const contentType = obj.contentType; // File content type.
    const file = admin
      .storage()
      .bucket(fileBucket)
      .file(filePath);
    console.log("file.name of upload ", file.name);

    if (contentType.endsWith("stream")) {//for uncompressed files change to type png and save db reference
      const uuid = UUID();
      const newMetadata = {
        contentType: 'image/png',
        metadata: {
          firebaseStorageDownloadTokens: uuid
        }
      }
      const nameAr = file.name.split('/');
      const usersIndex = nameAr.indexOf('users');
      console.log("nameAr", nameAr);
      const userId = nameAr[usersIndex + 1];
      file.setMetadata(newMetadata).then(() => {
        console.log("file.setMetadata then")

        const img_url = 'https://firebasestorage.googleapis.com/v0/b/' + fileBucket + '/o/'
          + encodeURIComponent(filePath)
          + '?alt=media&token='
          + newMetadata.metadata.firebaseStorageDownloadTokens;
        console.log("img_url", img_url);
        const fileName = nameAr.pop()
        // const tileType = nameAr[usersIndex + 5].split('.');
        // const key = tileType[0];
        const titleFromZipName = nameAr[usersIndex + 4].replace('_zip', '')
        const acceptableKeys = ["nx", "ny", "nz", "px", "py", "pz"];
        const assetId = nameAr[usersIndex + 3];
        acceptableKeys.forEach(key => {
          if (fileName.indexOf(key) >= 0 ) {
            const data = {
              [key]: img_url,
              title: titleFromZipName
            };
            const refPath = "users/" + userId + '/surrounds/' + assetId;
            const db = admin.database();
            const cubeBoxRef = db.ref(refPath);
            console.log("saving data to db refPath, data,img_url", refPath, data, img_url);
            cubeBoxRef.update(data);
          }
        })
      })
    }

    // We only want to deal with ZIP archives
    if (!file.name.endsWith('.zip')) {
      return;
    }

    await file
      .createReadStream()
      .pipe(unzipper.Parse())
      .on('entry', (entry: any) => {
        console.log("entry from zip", entry);
        console.log("entry.path", entry.path);
        const destination = admin
          .storage()
          .bucket()
          .file(`${file.name.replace('.', '_')}/${entry.path}`);
        if (entry.path.charAt(0) !== "_") {
          entry.pipe(destination.createWriteStream());
        }
      })
      .promise();

    await file.delete();
  });