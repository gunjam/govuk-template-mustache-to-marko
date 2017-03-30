'use strict';

const path = require('path');
const gulp = require('gulp');
const flatten = require('gulp-flatten');
const hogan = require('gulp-hogan');
const rename = require('gulp-rename');
const replace = require('gulp-replace');

const ASSET_PATH = 'static'

gulp.task('move', () => {
  gulp.src('node_modules/govuk_*/**/*.@(js|css|png|gif|jpg|jpeg|ico|eot|svg)')
    .pipe(rename(path => {
      path.dirname = path.dirname.replace(/^.*?[\\/](?:assets)?/, '').replace(/\b(?=icon-)/, 'icons/');
      if (path.basename.indexOf('icon-') === 0) {
        path.dirname += '/icons';
      }
    }))
    .pipe(gulp.dest(ASSET_PATH));

  gulp.src('assets/**/*.@(js|css|png|gif|jpg|jpeg|ico|eot)')
    .pipe(rename(path => {
      path.dirname = path.dirname.replace('assets', '');
    }))
    .pipe(gulp.dest(ASSET_PATH));
});

gulp.task('template', () => {
  return gulp.src('node_modules/govuk_*/**/layouts/govuk_template.html')
    .pipe(flatten())
    .pipe(replace(/{{[{]?(.*?)}}[}]?/g, '{{{$1}}}'))
    .pipe(replace(/\n/, '<lasso-page package-path="${input.packagePath}" dependencies=["./' + ASSET_PATH + '/javascripts/govuk-template.js"] name="${input.name}"/>\n'))
    .pipe(replace(/(<html class="lte-ie8" lang=")(.+)(">)/, '$!{\'$1\'}$2$!{\'$3\'}'))
    .pipe(replace(/<script.*?govuk-template\.js.*<\/script>/, ''))
    .pipe(hogan({
      assetPath: '/' + ASSET_PATH + '/',
      afterHeader: '<include(input.afterHeader)/>',
      bodyClasses: '${input.bodyClasses}',
      bodyEnd: '<lasso-body/><include(input.bodyEnd)/>',
      content: '<include(input.content)/>',
      cookieMessage: '<include(input.cookieMessage)/>',
      crownCopyrightMessage: '<include(input.crownCopyrightMessage)/>',
      footerSupportLinks: '<include(input.footerSupportLinks)/>',
      footerTop: '<include(input.footerTop)/>',
      globalHeaderText: '<if(input.globalHeaderText)><include(input.globalHeaderText)/></if><else>GOV.UK</else>',
      head: '<lasso-head/><include(input.head)/>',
      headerClass: '${input.headerClass}',
      homepageUrl: '${input.homepageUrl}',
      htmlLang: '${input.htmlLang}',
      insideHeader: '<include(input.insideHeader)/>',
      licenceMessage: '<include(input.licenceMessage)/>',
      logoLinkTitle: '${input.logoLinkTitle}',
      pageTitle: '${input.pageTitle}',
      propositionHeader: '<include(input.propositionHeader)/>',
      skipLinkMessage: '<include(input.skipLinkMessage)/>'
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
