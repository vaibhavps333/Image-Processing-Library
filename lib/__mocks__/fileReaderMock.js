class FileReader {
    constructor() {
      this.result = null;
      this.onload = null;
    }
  
    readAsDataURL(blob) {
      setTimeout(() => {
        this.result = 'data:image/jpeg;base64,'; // You can set a base64 string or any mock value here
        if (this.onload) this.onload({ target: { result: this.result } });
      }, 100);
    }
  
    readAsArrayBuffer(blob) {
      setTimeout(() => {
        this.result = new ArrayBuffer(0); // Mocked result as an ArrayBuffer
        if (this.onload) this.onload({ target: { result: this.result } });
      }, 100);
    }
  }
  
  global.FileReader = FileReader;
  