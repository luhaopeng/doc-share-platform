"use strict";

;

(function () {
  var uploader;
  var curStep = 1;
  $(function () {
    initUploader();
    initNavBtn();
    initSelect();
  });

  function initUploader() {
    var $modal = $('#uploadModal');
    var $progress = $modal.find('.progress .progress-bar');
    var $header = $modal.find('.modal-header .modal-title');
    var $title = $modal.find('.modal-body h4');
    var md5;
    WebUploader.Uploader.register({
      'before-send-file': function beforeSendFile(file) {
        var task = new $.Deferred();
        verifyForm({
          md5: md5
        }, function (res) {
          var status = res.status,
              missChunkList = res.missChunkList;

          if (status === 1000) {
            // form data check fail
            task.reject();
            validate();
          } else {
            if (status === 102) {
              // partial
              file.missChunks = missChunkList;
            }

            task.resolve();
          }
        });
        return $.when(task);
      },
      'before-send': function beforeSend(block) {
        var task = new $.Deferred();
        var file = block.file;
        var missChunks = file.missChunks;
        var blockChunk = block.chunk;

        if (missChunks && !missChunks.find(function (v) {
          return blockChunk == v;
        })) {
          task.reject();
        } else {
          task.resolve();
        }

        return $.when(task);
      }
    });
    var url = $('base').attr('href') + 'fileData/doFileUpload';
    uploader = new WebUploader.Uploader({
      server: url,
      chunked: true,
      chunkSize: parseInt(chunkSize, 10),
      fileSizeLimit: parseInt(maxFileSize, 10),
      fileSingleSizeLimit: parseInt(maxFileSize, 10),
      pick: {
        id: '#pickBtn',
        multiple: false
      },
      formData: {
        md5: '',
        chunkSize: parseInt(chunkSize, 10)
      },
      accept: {
        title: '文件',
        extensions: 'txt,mat',
        mimeTypes: 'text/plain,application/matlab-mat'
      }
    });
    uploader.on('beforeFileQueued', function () {
      // single file once
      uploader.reset();
    }).on('fileQueued', function (file) {
      // initialize
      $progress.width('0').text('');
      $header.text('检测文档');
      $title.text('文档检测中...');
      $modal.modal(); // md5

      uploader.md5File(file, function (percentage) {
        var width = (percentage * 100).toFixed() + '%';
        $progress.width(width).text(width);
      }, 0, parseInt(md5End, 10)).then(function (val) {
        md5 = val;
        verifyMd5({
          md5: md5
        }, function (res) {
          $progress.width('100%').text('100%');

          if (res.ret) {
            $title.text('文档已上传过，请更换');
          } else {
            $title.text('可以上传！'); // file name

            $('.step-1 .cur-file').addClass('show').children('code').text(file.name); // enable btn

            $('#navNext').removeAttr('disabled').removeAttr('title');
          } // hide modal


          setTimeout(function () {
            $modal.modal('hide');
          }, 2000);
        });
      });
    }).on('error', function (type) {
      if (type === 'Q_EXCEED_SIZE_LIMIT') {
        toastErr({
          icon: 'warning',
          heading: '文件被拒绝',
          text: '文件大小超出限制'
        });
      } else if (type === 'Q_TYPE_DENIED') {
        toastErr({
          icon: 'warning',
          heading: '文件被拒绝',
          text: '文件类型错误'
        });
      }
    }).on('startUpload', function () {
      // initialize
      $progress.width('0').text('');
      $header.text('上传文档');
      $title.text('文档上传中...');
      $modal.modal();
    }).on('uploadBeforeSend', function (obj, data) {
      data.md5 = md5;
    }).on('uploadProgress', function (file, percentage) {
      var width = (percentage * 100).toFixed() + '%';
      $progress.width(width).text(width);
    }).on('uploadSuccess', function () {
      $title.text('上传成功！'); // hide modal

      setTimeout(function () {
        $modal.modal('hide');
        next();
      }, 2000);
    }).on('uploadError', function () {
      $title.text('上传失败，请稍后重试'); // hide modal

      setTimeout(function () {
        $modal.modal('hide');
      }, 2000);
    });
  }

  function initNavBtn() {
    $('#navPrev').on('click', prev);
    $('#navNext').on('click', function () {
      if (curStep === 1 && uploader && uploader.getFiles().length > 0) {
        next();
      }
    });
    $('#startUpload').on('click', function () {
      if (!uploader.isInProgress()) {
        validate() && uploader.upload();
      }
    });
  }

  function initSelect() {
    // parse filter obj
    var filterObj = JSON.parse(filterObjStr);
    var brands = filterObj.BRAND.map(function (obj) {
      return {
        id: obj.value,
        label: obj.name
      };
    });
    var categories = filterObj.CLASS_ONE.map(function (obj) {
      var children = obj.childrens.map(function (child) {
        return {
          id: child.value,
          label: child.name
        };
      });
      return {
        id: obj.value,
        label: obj.name,
        children: children
      };
    }); // category level

    var $level1 = $('#catLevel1');
    var $level2 = $('#catLevel2');
    $level1.html('<option value>请选择分类...</option>');
    $level2.html('<option value>请选择一级分类...</option>');
    categories.map(function (cat1) {
      $level1.append("\n        <option value=\"".concat(cat1.id, "\">").concat(cat1.label, "</option>\n      "));
    });
    $level1.on('change', function () {
      $level2.html('');
      var val = $(this).val();
      var options = categories.find(function (v) {
        return v.id == val;
      }).children;

      if (options.length) {
        options.map(function (v) {
          $level2.append("<option value=\"".concat(v.id, "\">").concat(v.label, "</option>"));
        });
      }
    }); // brand

    var $brand = $('#brand');
    $brand.html('<option value>请选择品牌...</option>');
    brands.map(function (brand) {
      $brand.append("\n        <option value=\"".concat(brand.id, "\">").concat(brand.label, "</option>\n      "));
    });
  }

  function validate() {
    var $form = $('.step.step-2 form');
    $form.addClass('validate');
    var $invalid = $form.find('.form-control:invalid');

    if ($invalid.length > 0) {
      $invalid.closest('.form-group').get(0).scrollIntoView({
        block: 'start',
        behavior: 'smooth'
      });
      return false;
    } else {
      return true;
    }
  }

  function verifyMd5(obj, done) {
    $.post('fileData/checkFileMD5', obj, done);
  }

  function verifyForm(obj, done) {
    var form = $('.step.step-2 form').get(0);
    var formData = {
      fileName: form['docTitle'].value,
      classOne: form['catLevel1'].value,
      classTwo: form['catLevel2'].value,
      brand: form['brand'].value,
      model: form['model'].value,
      modelAbbreviation: form['modelAbbr'].value,
      standard: form['specs'].value,
      ratedV: form['volSt'].value,
      ratedI: form['curSt'].value,
      ratedP: form['powSt'].value,
      pattern: form['mode'].value,
      equipment: form['collector'].value,
      equipmentBrand: form['brandColl'].value,
      equipmentModel: form['modelColl'].value,
      samplingRate: form['rateColl'].value,
      variableRatio: form['ratioColl'].value,
      unitV: form['volUnit'].value,
      unitI: form['curUnit'].value,
      remark: form['note'].value
    };
    $.post('fileData/checkFileUpload', Object.assign({}, formData, obj), function (res) {
      handleResult(res, done);
    });
  }

  function prev() {
    var $content = $('.content');
    var $steps = $('.steps');
    var cur = $steps.find('.steps-item-process').index();

    if (cur > 0) {
      curStep--; // switch steps

      var $items = $steps.find('.steps-item');
      $items.eq(cur - 1).removeClass('steps-item-finish').addClass('steps-item-process');
      $items.eq(cur).removeClass('steps-item-process').addClass('steps-item-wait'); // switch content

      $content.find(".step.step-".concat(curStep + 1)).removeClass('current');
      $content.find(".step.step-".concat(curStep)).addClass('current'); // switch action

      $content.find('.nav-action').removeClass("step-".concat(curStep + 1)).addClass("step-".concat(curStep));
    }
  }

  function next() {
    var $content = $('.content');
    var $steps = $('.steps');
    var cur = $steps.find('.steps-item-process').index();
    var $items = $steps.find('.steps-item');
    var size = $items.length;

    if (cur < size - 1) {
      curStep++; // switch steps

      $items.eq(cur + 1).removeClass('steps-item-wait').addClass('steps-item-process');
      $items.eq(cur).removeClass('steps-item-process').addClass('steps-item-finish'); // switch content

      $content.find(".step.step-".concat(curStep - 1)).removeClass('current');
      $content.find(".step.step-".concat(curStep)).addClass('current'); // switch action

      $content.find('.nav-action').removeClass("step-".concat(curStep - 1)).addClass("step-".concat(curStep));
    }
  }
})();