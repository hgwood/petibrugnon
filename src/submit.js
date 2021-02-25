#!/usr/bin/env node

import { upload } from "./upload.js";
import { zip } from "./zip.js";

zip()
  .then(() => {
    return upload();
  })
  .catch(console.error);
