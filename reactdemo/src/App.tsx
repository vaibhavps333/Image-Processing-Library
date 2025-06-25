import React, { useState, ChangeEvent } from 'react';
import {
  Button, TextField, MenuItem, Card, CardContent, CardHeader, FormControl, InputLabel, Select, Checkbox, FormGroup, FormControlLabel, Typography, Grid, Tooltip
} from '@material-ui/core';
import { ImageProcessor, ImageProcessingOptions, CompressionOptions } from 'test-imgp';
import { makeStyles } from '@material-ui/core/styles';

const modes = [
  { value: 'enhancement', label: 'Enhancement' },
  { value: 'compression', label: 'Compression' },
  { value: 'both', label: 'Both' },
  { value: 'direct', label: 'Direct' }
];

const compressionLevels = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'highest', label: 'Highest' }
];

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: '#303030',
    color: '#fff',
    minHeight: '100vh',
    padding: '20px',
  },
  card: {
    backgroundColor: '#424242',
    color: '#fff',
    marginBottom: '20px',
    borderRadius: '10px',
  },
  formControl: {
    marginBottom: '20px',
  },
  button: {
    marginTop: '20px',
    '&:hover': {
      backgroundColor: '#ef7c1a',
    },
  },
  imagePreviewContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '20px',
    marginTop: '20px',
  },
  imageContainer: {
    maxWidth: '45%',
    textAlign: 'center',
    borderRadius: '10px',
    border: '1px solid #ccc',
    padding: '10px',
    backgroundColor: '#525252',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
  },
  image: {
    maxWidth: '100%',
    borderRadius: '10px',
    transition: 'opacity 0.5s ease',
  },
}));

interface ProcessedImage {
  original: {
    dataUrl: string;
    size: string;
  };
  processed: {
    dataUrl: string;
    size: string;
    compressionRatio: string;
    enhancementDetails: string;
  };
}

function App() {
  const classes = useStyles();
  const [mode, setMode] = useState<string>('compression');
  const [enhancementOptions, setEnhancementOptions] = useState({
    brightness: 20,
    contrast: 5,
    saturation: 1,
    texture: true,
    sharpening: true,
  });
  const [compressionOptions, setCompressionOptions] = useState<CompressionOptions>({
    level: 'normal',
  });
  const [maxFileSizeMB, setMaxFileSizeMB] = useState<number>(50);
  const [maxImageCount, setMaxImageCount] = useState<number>(10);
  const [supportedFormats, setSupportedFormats] = useState<string[]>(['image/jpeg', 'image/png']);
  const [error, setError] = useState<string | null>(null);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);

  const imageProcessor = new ImageProcessor();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files as FileList);
    if (files.length) {
      setProcessedImages([]);
      const config: ImageProcessingOptions = {
        mode: mode as any,
        enhancementOptions,
        compressionOptions,
        maxFileSizeMB,
        maxImageCount,
        supportedFormats,
      };

      imageProcessor
        .processImages(files, config)
        .then((results) => {
          const images = results.map((result, index) => {
            const originalFile = files[index];
            const compressedSize = (result.blob as Blob).size / 1024; // in KB
            const originalSize = originalFile.size / 1024; // in KB
            const compressionRatio = ((compressedSize / originalSize) * 100).toFixed(2) + '%';

            return {
              original: {
                dataUrl: URL.createObjectURL(originalFile),
                size: originalSize.toFixed(2),
              },
              processed: {
                dataUrl: URL.createObjectURL(result.blob as Blob),
                size: compressedSize.toFixed(2),
                compressionRatio,
                enhancementDetails: `Brightness: ${enhancementOptions.brightness}, Contrast: ${enhancementOptions.contrast}, Saturation: ${enhancementOptions.saturation}`,
              },
            };
          });
          setProcessedImages(images);
        })
        .catch((error) => setError(error.message));
    }
  };

  const handleProcessImages = () => {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input && input.files?.length) {
      handleFileChange({ target: input } as ChangeEvent<HTMLInputElement>);
    } else {
      setError('No files selected');
    }
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom align="center">
        Image Processing Dashboard
      </Typography>
      <Card className={classes.card}>
        <CardHeader title="Upload Images" />
        <CardContent>
          <input type="file" multiple onChange={handleFileChange} accept="image/*" />
          {error && <Typography color="error">{error}</Typography>}
        </CardContent>
      </Card>

      <Card className={classes.card}>
        <CardHeader title="Configuration Options" />
        <CardContent>
          <FormControl fullWidth className={classes.formControl}>
            <InputLabel>Mode</InputLabel>
            <Select value={mode} onChange={(e) => setMode(e.target.value as string)}>
              {modes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(mode === 'enhancement' || mode === 'both') && (
            <Card className={classes.card}>
              <CardHeader title="Enhancement Options" />
              <CardContent>
                <TextField
                  fullWidth
                  type="number"
                  label="Brightness"
                  value={enhancementOptions.brightness}
                  onChange={(e) =>
                    setEnhancementOptions({ ...enhancementOptions, brightness: +e.target.value })
                  }
                  style={{ marginBottom: '10px' }}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Contrast"
                  value={enhancementOptions.contrast}
                  onChange={(e) =>
                    setEnhancementOptions({ ...enhancementOptions, contrast: +e.target.value })
                  }
                  style={{ marginBottom: '10px' }}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Saturation"
                  value={enhancementOptions.saturation}
                  onChange={(e) =>
                    setEnhancementOptions({ ...enhancementOptions, saturation: +e.target.value })
                  }
                  style={{ marginBottom: '10px' }}
                />
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enhancementOptions.texture}
                        onChange={(e) =>
                          setEnhancementOptions({ ...enhancementOptions, texture: e.target.checked })
                        }
                      />
                    }
                    label="Texture"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enhancementOptions.sharpening}
                        onChange={(e) =>
                          setEnhancementOptions({ ...enhancementOptions, sharpening: e.target.checked })
                        }
                      />
                    }
                    label="Sharpening"
                  />
                </FormGroup>
              </CardContent>
            </Card>
          )}

          {(mode === 'compression' || mode === 'both') && (
            <Card className={classes.card}>
              <CardHeader title="Compression Options" />
              <CardContent>
                <FormControl fullWidth>
                  <InputLabel>Compression Level</InputLabel>
                  <Select
                    value={compressionOptions.level}
                    onChange={(e) =>
                      setCompressionOptions({ ...compressionOptions, level: e.target.value as 'low' | 'normal' | 'high' | 'highest' })
                    }
                  >
                    {compressionLevels.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          )}

          <Button variant="contained" color="secondary" className={classes.button} onClick={handleProcessImages}>
            Process Images
          </Button>
        </CardContent>
      </Card>

      {processedImages.length > 0 && (
        <div className={classes.imagePreviewContainer}>
          {processedImages.map((img, index) => (
            <div key={index} className={classes.imageContainer}>
              <Typography variant="h6">Original Image</Typography>
              <img src={img.original.dataUrl} alt="Original" className={classes.image} />
              <Typography>Size: {img.original.size} KB</Typography>
              <Typography>Compression Ratio: {img.processed.compressionRatio}</Typography>

              <Typography variant="h6" style={{ marginTop: '20px' }}>Processed Image</Typography>
              <img src={img.processed.dataUrl} alt="Processed" className={classes.image} />
              <Typography>Size: {img.processed.size} KB</Typography>
              <Typography>{img.processed.enhancementDetails}</Typography>
              <Tooltip title="Download Processed Image" arrow>
                <Button variant="contained" color="primary" href={img.processed.dataUrl} download={`processed_image_${index + 1}.png`}>
                  Download Processed Image
                </Button>
              </Tooltip>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
