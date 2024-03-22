import { Injectable } from '@angular/core';

import { EMPTY, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Product } from './product.interface';

import { ApiService } from '../core/api.service';

@Injectable({
	providedIn: 'root',
})
export class ProductsService extends ApiService {
	createNewProduct(product: Product): Observable<Product> {
		if (!this.endpointEnabled('bff')) {
			console.warn(
				'Endpoint "bff" is disabled. To enable change your environment.ts config'
			);
			return EMPTY;
		}

		const url = this.getUrl('bff', 'products');
		return this.http.post<Product>(url, product);
	}

	editProduct(id: string, changedProduct: Product): Observable<Product> {
		if (!this.endpointEnabled('bff')) {
			console.warn(
				'Endpoint "bff" is disabled. To enable change your environment.ts config'
			);
			return EMPTY;
		}

		const url = this.getUrl('bff', `products/${id}`);
		return this.http.put<Product>(url, changedProduct);
	}

	getProductById(id: string): Observable<Product | null> {
		if (this.endpointEnabled('bff')) {
			const bffUrl = this.getUrl('bff', `products/${id}`);
			return this.http
				.get<{ product: Product }>(bffUrl)
				.pipe(map((resp) => resp.product));
		} else if(this.endpointEnabled('product')) {
			const productUrl = this.getUrl('product', `products/${id}`);
			return this.http.get<Product>(productUrl);
		} else {
			return this.http
				.get<Product[]>('/assets/products.json')
				.pipe(
					map(
						(products) =>
							products.find((product) => product.id === id) ||
							null
					)
				);
		}
	}

	getProducts(): Observable<Product[]> {
		if (this.endpointEnabled('bff')) {
			const bffUrl = this.getUrl('bff', 'products');
			return this.http.get<Product[]>(bffUrl);
		} else if (this.endpointEnabled('product')) {
			const productUrl = this.getUrl('product', 'products');
			return this.http.get<Product[]>(productUrl);
		} else {
			return this.http.get<Product[]>('/assets/products.json');
		}
	}

	getProductsForCheckout(ids: string[]): Observable<Product[]> {
		if (!ids.length) {
			return of([]);
		}

		return this.getProducts().pipe(
			map((products) =>
				products.filter((product) => ids.includes(product.id))
			)
		);
	}
}
