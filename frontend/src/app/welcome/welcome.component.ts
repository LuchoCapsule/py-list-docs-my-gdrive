import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../services/shared.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule

interface ILocalImage {
  name: string;
  id: number;
  alt: string;
  selected?: boolean; // Add the selected property
  group: number
}

interface IGDImage {
  name: string;
  id: number;
  alt: string;
  selected?: boolean; // Add the selected property
  group: number,
  binario: string
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule // Add FormsModule to imports
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WelcomeComponent { 
  token: string | null = null;
  isLoading: boolean = false;
  localImages: ILocalImage[] = [];
  gdImages: IGDImage[] = [];

  constructor(private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private cdr: ChangeDetectorRef  // Inject ChangeDetectorRef
  ){
    console.log('WelcomeComponent created');

    this.route.queryParams.subscribe(params => {
      const myToken = params['myTokenParameter'];
      if (myToken) {
        console.log('myToken', myToken);
        this.sharedService.saveToken(myToken);
        //this.fnGetImageList(myToken);
        this.token = this.sharedService.getToken();
        console.log('Retrieved token:', this.token);
      } else {
        console.log('no TOKEN');
        this.router.navigate(['/app-not-found']);
      }
    });
  }
    fnLoadLocalImages() {
      console.log('Loading local images');
      this.isLoading = true;
  
      // Delay the HTTP GET request by 2 seconds
      setTimeout(() => {
          this.http.get<ILocalImage[]>('assets/testing-imgs/image-list.json').subscribe({
              next: (imageList) => {
                  console.log('Local images loaded:', imageList); 
  
                  this.localImages = imageList.map((image, index) => {
                      if (index % 2 == 0) {
                          return {
                              ...image, 
                              selected: true,
                              group: 1
                          };
                      } else if (index % 3 == 0) {
                          return {
                              ...image, 
                              selected: true,
                              group: 2
                          };
                      } else {
                          return {
                              ...image, 
                              selected: false,
                              group: 3
                          };
                      } 
                  });
                  this.isLoading = false;
                  this.cdr.detectChanges();
                  console.log('Local images:', this.localImages);
              },
              error: (error) => {
                  console.error('Error loading local images:', error);
                  this.isLoading = false;
              },
              complete: () => {
                  console.log('Loading local images complete');
                  this.isLoading = false;
              }
          });
      }, 2000); // 2-second delay
  }
  fnGetImageList() {
    this.token = this.sharedService.getToken();
    console.log('Fetching images with token:', this.token);
  
    // Define the payload for the POST request
    const payload = {
      token: this.token
    };
    // Set loading state to true
    this.isLoading = true;
            
    // Make the POST request
    this.http.post<any[]>('http://localhost:5000/fetch-images', payload).subscribe({
    next: (images) => 
    {
        console.log('Returned images from my Google Drive', images);
        
        this.gdImages = images.map((image, index) => {
          return {
              ...image, 
              selected: false,
              binario : `data:image/jpeg;base64,${image.binario}`,
              
          }
        });
        console.log('Google Drive images:', this.gdImages);

        // // Populate the images div with the fetched images
        // const imagesDiv = document.getElementById('images');
        // if (imagesDiv) {
        //     imagesDiv.innerHTML = ''; // Clear any existing images
        //     images.forEach(image => {
        //         const colDiv = document.createElement('div');
        //         colDiv.className = 'col';
                
        //         const cardDiv = document.createElement('div');
        //         cardDiv.className = 'card';
        
        //         const imgElement = document.createElement('img');
        //         imgElement.src = `data:image/jpeg;base64,${image.binario}`;
        //         imgElement.alt = image.name;
        //         imgElement.className = 'card-img-top';
        
        //         cardDiv.appendChild(imgElement);
        //         colDiv.appendChild(cardDiv);
        //         imagesDiv.appendChild(colDiv);
        //     });
        // } else {
        //     console.error('Element with id "images" not found.');
        //     // Set loading state to false
        //     this.isLoading = false;
        //     this.cdr.detectChanges();
        // }
    },
    error: (error) => {
        console.error('Error fetching images:', error);
        // Set loading state to false
        this.isLoading = false;
        this.cdr.detectChanges();
    },
    complete: () => {
        console.log('Loading images complete');
        this.isLoading = false;
        this.cdr.detectChanges();
    }
    });
  }
  fnRemoveSelectedImagesFromBackend() {
    const selectedImages = this.gdImages.filter(image => image.selected);
    const payload = {
      token: this.token,
      image_ids: selectedImages.map(image => image.id)
    };

    this.isLoading = true;

    this.http.request('delete', 'http://localhost:5000/delete-images', { body: payload }).subscribe({
      next: (response) => {
        console.log('Images removed successfully:', response);
        this.fnRemoveSelectedGdImages(); // Remove images from the UI
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error removing images:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('Image removal complete');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  uniqueGroups(): number[] {
    const groups = this.localImages.map(img => img.group);
    return Array.from(new Set(groups));
  }

  fnGDUniqueGroups(): number[] {
    const groups = this.gdImages.map(img => img.group);
    return Array.from(new Set(groups));
  }

  fnShowSelectedImages() {
    console.log('Selected images:', this.localImages);
    
  }
  fnRemoveSelectedImages() {
    console.log('Removing selected images');
    this.localImages = this.localImages.filter(image => !image.selected);
    console.log('Remaining images:', this.localImages);
  }
  fnRemoveSelectedGdImages() {
    console.log('Removing selected images');
    this.gdImages = this.gdImages.filter(image => !image.selected);
    console.log('Remaining images:', this.gdImages);
  }
  fnHasSelectedImages(): boolean {
    return this.localImages.some(img => img.selected);
  }
  fnHasSelectedGdImages(): boolean {
    return this.gdImages.some(img => img.selected);
  }
}
