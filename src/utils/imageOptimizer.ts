// Image optimization utilities
export class ImageOptimizer {
  private static instance: ImageOptimizer;

  private constructor() {}

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  // Convert image to WebP format if supported
  async convertToWebP(file: File): Promise<File | null> {
    if (!this.supportsWebP()) {
      return null;
    }

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp'
            });
            resolve(webpFile);
          } else {
            resolve(null);
          }
        }, 'image/webp', 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Compress image
  async compressImage(file: File, quality: number = 0.8, maxWidth: number = 1920): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Generate responsive image URLs
  generateResponsiveUrls(baseUrl: string): { [key: string]: string } {
    const sizes = [320, 640, 960, 1280, 1920];
    const formats = ['webp', 'jpg'];
    const urls: { [key: string]: string } = {};

    formats.forEach(format => {
      sizes.forEach(size => {
        const key = `${size}w_${format}`;
        urls[key] = `${baseUrl}?w=${size}&f=${format}&q=80`;
      });
    });

    return urls;
  }

  // Create progressive image loading
  createProgressiveLoader(img: HTMLImageElement, lowQualityUrl: string, highQualityUrl: string): void {
    // Load low quality first
    img.src = lowQualityUrl;
    img.style.filter = 'blur(5px)';
    img.style.transition = 'filter 0.3s ease';

    // Load high quality in background
    const highQualityImg = new Image();
    highQualityImg.onload = () => {
      img.src = highQualityUrl;
      img.style.filter = 'none';
    };
    highQualityImg.src = highQualityUrl;
  }

  // Lazy loading setup
  setupLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // Check WebP support
  supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  // Preload critical images
  preloadImages(urls: string[]): Promise<void[]> {
    const promises = urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });
    });

    return Promise.all(promises);
  }

  // Get image metadata
  getImageMetadata(file: File): Promise<{
    width: number;
    height: number;
    size: number;
    type: string;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type
        });
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
}

// React hook for image optimization
export const useImageOptimizer = () => {
  const optimizer = ImageOptimizer.getInstance();

  const optimizeImage = async (file: File, options?: {
    quality?: number;
    maxWidth?: number;
    convertToWebP?: boolean;
  }) => {
    const { quality = 0.8, maxWidth = 1920, convertToWebP = true } = options || {};
    
    let optimizedFile = await optimizer.compressImage(file, quality, maxWidth);
    
    if (convertToWebP) {
      const webpFile = await optimizer.convertToWebP(optimizedFile);
      if (webpFile) {
        optimizedFile = webpFile;
      }
    }
    
    return optimizedFile;
  };

  const preloadImages = (urls: string[]) => {
    return optimizer.preloadImages(urls);
  };

  const setupLazyLoading = () => {
    optimizer.setupLazyLoading();
  };

  const getImageMetadata = (file: File) => {
    return optimizer.getImageMetadata(file);
  };

  return {
    optimizeImage,
    preloadImages,
    setupLazyLoading,
    getImageMetadata,
    supportsWebP: optimizer.supportsWebP()
  };
};