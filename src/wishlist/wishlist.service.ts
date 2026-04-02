import { Injectable } from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishlistRepository } from './wishlist.repository';

@Injectable()
export class WishlistService {
  constructor(private readonly repo: WishlistRepository) {}

  toggleWishlist(userId: number, slug: string) {
    return this.repo.toggleWishlist(userId, slug);
  }

  getMyWishlist(userId: number) {
    return this.repo.getMyWishlist(userId);
  }
}
