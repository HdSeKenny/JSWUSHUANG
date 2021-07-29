// https://date-fns.org/docs/format
import format from 'date-fns/format'

export function formatDate(date, string) {
  return format(date, string || 'MM/dd hh:mm')
}

export function confirm (_this, success, cancel) {
  _this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    success()
  }).catch(() => {
    cancel && cancel()
  })
}

export function handleError(_this, message) {
  _this.$message({
    showClose: true,
    message,
    type: 'error',
  })
}

export function handleSuccess(_this, message) {
  _this.$message({
    showClose: true,
    message,
    type: 'success',
  })
}

export function countDown(dateTime, item) {
  // Update the count down every 1 second
  item.countDownInterval = setInterval(function() {

    // Get today's date and time
    const now = new Date().getTime();

    // Find the distance between now and the count down date
    const distance = dateTime - now;

    // Time calculations for days, hours, minutes and seconds
    item.days = Math.floor(distance / (1000 * 60 * 60 * 24));
    item.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    item.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    item.seconds = Math.floor((distance % (1000 * 60)) / 1000);
  }, 1000);

  return item;
}

export function clearCountDown(countInterval) {
  clearInterval(countInterval);
}


export function getAuctionStyle(status) {
  let style = ''
  if (status === 0) {
    style = 'auction-will'
  }
  else if (status === 1) {
    style = 'aucting'
  }
  else if (status === 2) {
    style = 'auction-end'
  }
  return style
}
