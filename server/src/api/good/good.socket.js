/* eslint-disable all, no-param-reassign */
import * as Goodcontroller from './good.controller'
import * as OrderController from '../order/order.controller'

export default (io, socket) => {
  socket.on('auction_send', (data) => {
    const newStatusGood = {
      current_price: data.current_price,
      current_payer: data.current_payer._id,
      previous_payer: data.previous_payer._id,
      auction_histories: data.auction_histories,
      started_at: data.started_at,
    }

    newStatusGood.auction_histories.push({
      au_price: data.current_price,
      au_player_name: data.current_payer.game_name,
      au_date: new Date(),
    })

    if (data.started_at) {
      newStatusGood.started_at = data.started_at
    }

    io.sockets.emit('auction_receive', {
      newStatusGood: {
        previous_price: data.previous_price,
        current_price: data.current_price,
        current_payer: {
          _id: data.current_payer._id,
          game_name: data.current_payer.game_name,
        },
        previous_payer: {
          _id: data.previous_payer._id,
          game_name: data.previous_payer.game_name,
        },
        auction_histories: newStatusGood.auction_histories,
        started_at: newStatusGood.started_at,
        au_type: data.au_type
      },
      good_id: data.good_id,
    })

    // update the auction info of the good
    Goodcontroller.saveGoodAuctionInfo(data.good_id, newStatusGood)

    // update the payment for the previous payer
    // and current payer dkp info
    Goodcontroller.updatePayersDkp({
      previous_price: data.previous_price,
      current_price: data.current_price,
      current_payer: {
        _id: data.current_payer._id,
        game_name: data.current_payer.game_name,
      },
      previous_payer: {
        _id: data.previous_payer._id,
        game_name: data.previous_payer.game_name,
      },
      au_type: data.au_type
    })
  })

  socket.on('auction_start', (data) => {
    io.sockets.emit('auction_start_back', data)
    Goodcontroller.onStartAuction(data)
  })

  socket.on('auction_end', async (data) => {
    io.sockets.emit('auction_end_back', data)

    try {
      const newGood = await Goodcontroller.onEndAuction(data)
      const order = await OrderController.showOneByGoodId(newGood._id)
      if (newGood.current_price && newGood.current_payer && !order) {
        await OrderController.onCreateNewOrder({
          price: newGood.current_price,
          created_at: new Date(),
          good_id: newGood._id,
          payer_id: newGood.current_payer
        })
        const newOrder = await OrderController.showOneByGoodId(newGood._id)
        io.sockets.emit('auction_payer_message', newOrder)
      }
    } catch (error) {
      console.error('auction_end error', error.toString())
    }
  })

  socket.on('add_new_good', (data) => {
    io.sockets.emit('add_new_good_back', data)
  })
}
