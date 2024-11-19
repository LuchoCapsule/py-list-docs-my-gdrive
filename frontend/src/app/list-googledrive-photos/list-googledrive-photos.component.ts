import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { routes } from '../app.routes';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list-googledrive-photos',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  templateUrl: './list-googledrive-photos.component.html',
  styleUrl: './list-googledrive-photos.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListGoogledrivePhotosComponent {
  images: any[] = [];

  constructor( private http: HttpClient, private route: ActivatedRoute) {
    console.log('ListGoogledrivePhotosComponent created');
    const dashboarRoutesOriginal = routes 
    
  }
  ngAfterViewInit() {
   //this.fnPopulateImages();
  }

  fnPopulateImages() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('images')) {
        const imagesParam = urlParams.get('images');
        const images = imagesParam ? JSON.parse(imagesParam) : [];
        const imagesDiv = document.getElementById('images');
        if (imagesDiv) {
            images.forEach((image: { webViewLink: string; name: string }) => {
                const imgElement = document.createElement('img');
                imgElement.src = image.webViewLink;
                imgElement.alt = image.name;
                imagesDiv.appendChild(imgElement);
            });
        } else {
            console.error('Element with id "images" not found.');
        }
    }else{
      console.log('no images');
    }
  }

  fnTest() {
    console.log('fnTest');    
     window.location.href = 'http://localhost:5000/auth/google'; 
    //window.location.href = 'https://gdphotos-backend-420f00bc3da4.herokuapp.com/auth/google'; 
    // this.route.queryParams.subscribe(params => {
    //   console.log('returned params', params);
    //   const token = params['token'];
    //   if (token) {
    //     //this.fetchImages(token);
    //     console.log('returned token', token);
    //   }
    // });

    //** AS Post request */
    // Define the payload for the POST request
  // const payload = {
  //   // Add any necessary data here
  //   key: 'value'
  // };

  // Make the POST request
  //this.http.post<any[]>('http://localhost:5000/auth/google', payload).subscribe(images => {
  //   this.http.post<any[]>('http://localhost:5000/auth/google', payload).subscribe(images => {
  //   this.images = images.map(image => ({
  //     ...image,
  //     binary: `data:image/jpeg;base64,${image.binary}`,
  //     webViewLink: image.webViewLink,
  //     name: image.name
  //   }));
  //   console.log('Returned images from my Google Drive', this.images);
  // });

    //** AS Get request */
    // this.http.get<any[]>('http://localhost:5000/auth/google').subscribe(images => {
    //   this.images = images.map(image => ({
    //     ...image,
    //     binary: `data:image/jpeg;base64,${image.binary}`,
    //     webViewLink: image.webViewLink,
    //     name: image.name
    //   }));
    //   console.log('Returned images from my Google Drive', this.images);
    // });


  }
 }
