'use strict';

const path = require('path');
const gulp = require('gulp');
const flatten = require('gulp-flatten');
const hogan = require('gulp-hogan');
const rename = require('gulp-rename');
const replace = require('gulp-replace');

gulp.task('move', () => {
  gulp.src('node_modules/govuk_*/**/*.@(js|css|png|gif|jpg|jpeg|ico|eot|svg)')
    .pipe(rename(path => {
      path.dirname = path.dirname.replace(/^.*?[\\/](?:assets)?/, '').replace(/\b(?=icon-)/, 'icons/');
      if (path.basename.indexOf('icon-') === 0) {
        path.dirname += '/icons';
      }
    }))
    .pipe(gulp.dest('static'));

  gulp.src('assets/**/*.@(js|css|png|gif|jpg|jpeg|ico|eot)')
    .pipe(rename(path => {
      path.dirname = path.dirname.replace('assets', '');
    }))
    .pipe(gulp.dest('static'));
});

gulp.task('template', () => {
  return gulp.src('node_modules/govuk_*/**/layouts/govuk_template.html')
    .pipe(flatten())
    .pipe(replace(/{{[{]?(.*?)}}[}]?/g, '{{{$1}}}'))
    .pipe(replace(/\n/, '<lasso-page package-path="${data.packagePath}" dependencies=["./static/javascripts/govuk-template.js"] name="${data.name}"/>\n'))
    .pipe(replace(/(<html class="lte-ie8" lang=")(.+)(">)/, '$!{\'$1\'}$2$!{\'$3\'}'))
    .pipe(replace(/<script.*?govuk-template\.js.*<\/script>/, ''))
    .pipe(hogan({
      assetPath: '/static/',
      afterHeader: '<layout-placeholder name="after-header"/>',
      bodyClasses: '${data.bodyClasses}',
      bodyEnd: '<layout-placeholder name="body-end"><lasso-body/></layout-placeholder>',
      content: '<layout-placeholder name="content"/>',
      cookieMessage: '<layout-placeholder name="cookie-message"/>',
      crownCopyrightMessage: '<layout-placeholder name="crown-copyright-message"/>',
      footerSupportLinks: '<layout-placeholder name="footer-support-links"/>',
      footerTop: '<layout-placeholder name="footer-top"/>',
      globalHeaderText: '<layout-placeholder name="global-header-text">GOV.UK</layout-placeholder>',
      head: '<layout-placeholder name="head"><lasso-head/></layout-placeholder>',
      headerClass: '${data.headerClass}',
      homepageUrl: '${data.homepageUrl}',
      htmlLang: '${data.htmlLang}',
      insideHeader: '<layout-placeholder name="inside-header"/>',
      licenceMessage: '<layout-placeholder name="licence-message"/>',
      logoLinkTitle: '${data.logoLinkTitle}',
      pageTitle: '<layout-placeholder name="page-title"/>',
      propositionHeader: '<layout-placeholder name="proposition-header"/>',
      skipLinkMessage: '<layout-placeholder name="skip-link-message"/>'
    }))
    .pipe(replace(/(<!-{0,2}){1,2}(\[[^\[\]]+\])?-{0,2}>(<!-->)?/g, '$!{\'$&\'}'))
    .pipe(replace(/(<!DOCTYPE html>)\n/g, '$1'))
    .pipe(replace(/(\$!{'<!\[endif]-->'})\n/g, '$1'))
    .pipe(replace(/<(link|meta|img)(.+href="|.+src="|.+property="og:image" content=")([^?]+)[^"]+([^>]*") *\/?>/g, (match, p1, p2, p3, p4, offset) => `<lasso-resource path=".${p3}" var="r${offset}"/><${p1}${p2}\${r${offset}.url}${p4}/>`))
    .pipe(replace(/(<script.+src=")([^?]+)[^"]+([^>]*" *><\/script>)/g, (match, p1, p2, p3, offset) => `<lasso-resource path=".${p2}" var="r${offset}"/>${p1}\${r${offset}.url}${p3}`))
    .pipe(rename('template.marko'))
    .pipe(gulp.dest(path.join(__dirname, '/.')));
});

gulp.task('default', ['move', 'template']);
