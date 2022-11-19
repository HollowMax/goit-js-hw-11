import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const BASE_LINK = 'https://pixabay.com/api/';
const LINK_KEY = '31430020-162717a02f14be47bba144d73';
let pageCount = 1;

const form = document.querySelector('form');
const galleryList = document.querySelector('.gallery');

const openModal = function (e) {
  e.preventDefault();
  const imageItem = new SimpleLightbox('.gallery a');
};

const render = function (arr) {
  let renderedList = '';
  arr.forEach(value => {
    renderedList += `<div class="photo-card">
  <a href="${value.largeImageURL}"><img src="${value.webformatURL}" alt="${value.tags}" loading="lazy"/></a  >
  <div class="info">
    <p class="info-item">
      <b>Likes:${value.likes}</b>
    </p>
    <p class="info-item">
      <b>Views:${value.views}</b>
    </p>
    <p class="info-item">
      <b>Comments:${value.comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads:${value.downloads}</b>
    </p>
  </div>
</div>`;
  });
  return renderedList;
};

const loadMore = async function (link) {
  pageCount++;
  const linkResponse = await axios({
    method: 'get',
    url: `${link}${pageCount}`,
    responseType: 'stream',
  });
  const gallery = JSON.parse(linkResponse.data);
  galleryList.lastChild.querySelector('img').addEventListener('load', event => {
    galleryList.insertAdjacentHTML('beforeend', render(gallery.hits));
    if (gallery.totalHits <= pageCount * 40) {
      Notify.warning("We're sorry, but you've reached the end of search results.");
    } else {
      loadMore(link);
    }
  });
};

const search = async function (query) {
  const queryString = query.trim();
  if (queryString === '') {
    return '';
  }
  const queryLink = `${BASE_LINK}?key=${LINK_KEY}&q=${queryString}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=`;
  const linkResponse = await axios({
    method: 'get',
    url: `${queryLink}${pageCount}`,
    responseType: 'stream',
  });

  const gallery = JSON.parse(linkResponse.data);
  if (gallery.hits.length === 0) {
    Notify.warning('Sorry, there are no images matching your search query. Please try again.');
    return null;
  }

  try {
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  } catch {}

  galleryList.innerHTML = render(gallery.hits);
  loadMore(queryLink);
  return gallery.totalHits;
};

form.addEventListener('submit', async e => {
  e.preventDefault();
  pageCount = 1;
  const total = await search(form.searchQuery.value);
  if (total) Notify.info(`Hooray! We found ${total} images.`);
});

galleryList.addEventListener('click', openModal);
