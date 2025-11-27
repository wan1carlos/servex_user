import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tagFilter'
})
export class TagFilterPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }

    searchText = searchText.toLowerCase();

    return items.filter(item => {
      // Check if the item has tags
      if (item.tags) {
        if (Array.isArray(item.tags)) {
          // Tags is an array
          return item.tags.some(tag => tag.toLowerCase().includes(searchText));
        } else if (typeof item.tags === 'string') {
          // Tags is a comma-separated string
          const tagArray = item.tags.split(',').map(tag => tag.trim().toLowerCase());
          return tagArray.some(tag => tag.includes(searchText));
        }
      }

      // For stores or items without tags, search in name
      return item.name && item.name.toLowerCase().includes(searchText);
    });
  }

}